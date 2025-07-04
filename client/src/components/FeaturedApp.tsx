import { Link } from "wouter";
import { Download, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { App } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface FeaturedAppProps {
  app: App;
}

export default function FeaturedApp({ app }: FeaturedAppProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-blue-200'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-roboto">Featured App</h2>
          <p className="text-lg text-gray-600">Recommended for KMTC Students</p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Card className="gradient-bg text-white card-shadow animate-slide-up overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    {app.logoUrl ? (
                      <img 
                        src={app.logoUrl} 
                        alt={`${app.name} logo`}
                        className="w-20 h-20 rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-blue-600 font-bold text-3xl ${app.logoUrl ? 'hidden' : ''}`}>
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="text-2xl font-bold mb-2 font-roboto">{app.name}</h3>
                  <p className="text-blue-100 mb-4 leading-relaxed">
                    {app.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 justify-center lg:justify-start">
                    <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                      {app.category}
                    </Badge>
                    <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                      KMTC Recommended
                    </Badge>
                    <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                      Medical Education
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                    <div className="flex items-center">
                      {renderStars(app.rating)}
                      <span className="ml-2 text-blue-100">{app.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-blue-200">•</span>
                    <span className="text-blue-100">{app.downloads} downloads</span>
                  </div>
                  
                  <div className="flex gap-4 justify-center lg:justify-start">
                    <Button 
                      onClick={handleDownload}
                      className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Now
                    </Button>
                    <Link href={`/app/${app.id}`}>
                      <Button 
                        variant="outline" 
                        className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-6 py-3"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="flex-shrink-0 hidden lg:flex gap-4">
                  {app.screenshots.slice(0, 2).map((screenshot, index) => (
                    <div key={index} className="w-24 h-18 rounded-lg overflow-hidden shadow-md">
                      <img 
                        src={screenshot} 
                        alt={`${app.name} screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://via.placeholder.com/120x80/4F46E5/ffffff?text=App+Screenshot`;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
