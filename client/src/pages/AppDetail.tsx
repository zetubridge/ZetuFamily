import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, Star, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/lib/api";
import { App } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function AppDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  
  const { data: app, isLoading, error } = useQuery({
    queryKey: [`/api/apps/${id}`],
    select: (data) => data as App,
  });

  const handleDownload = async () => {
    if (!app) return;
    
    try {
      await api.downloadApp(app.id);
      window.open(app.downloadUrl, '_blank');
      toast({
        title: "Download Started",
        description: `${app.name} is being downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!app) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: app.name,
          text: app.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "App link has been copied to clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to share the app.",
          variant: "destructive",
        });
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" className="py-20" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">App Not Found</h1>
            <p className="text-gray-600 mb-8">The app you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Apps
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="card-shadow">
              <CardContent className="p-8">
                <div className="flex items-start mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mr-6 flex-shrink-0">
                    {app.logoUrl ? (
                      <img 
                        src={app.logoUrl} 
                        alt={`${app.name} logo`}
                        className="w-16 h-16 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-white font-bold text-3xl ${app.logoUrl ? 'hidden' : ''}`}>
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-roboto">{app.name}</h1>
                    <p className="text-lg text-gray-600 mb-3">by {app.developerName}</p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary" className="text-sm">
                        {app.category}
                      </Badge>
                      <div className="flex items-center">
                        {renderStars(app.rating)}
                        <span className="ml-2 text-gray-600 font-medium">{app.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500">{app.downloads} downloads</span>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleDownload}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download App
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleShare}
                        className="px-6 py-3"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">About this app</h2>
                    <p className="text-gray-700 leading-relaxed">{app.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Screenshots</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {app.screenshots.map((screenshot, index) => (
                        <div key={index} className="rounded-lg overflow-hidden border">
                          <img 
                            src={screenshot} 
                            alt={`${app.name} screenshot ${index + 1}`}
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://via.placeholder.com/400x300/4F46E5/ffffff?text=Screenshot+${index + 1}`;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="card-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">App Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Developer</dt>
                    <dd className="text-sm text-gray-900">{app.developerName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">{app.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Downloads</dt>
                    <dd className="text-sm text-gray-900">{app.downloads.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Rating</dt>
                    <dd className="text-sm text-gray-900">{app.rating.toFixed(1)} out of 5</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="card-shadow">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Developer</h3>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-medium">
                      {app.developerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{app.developerName}</p>
                    <p className="text-sm text-gray-500">App Developer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
