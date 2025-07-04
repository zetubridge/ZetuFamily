import { Link } from "wouter";
import { Star, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { App } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AppCardProps {
  app: App;
  showFullDescription?: boolean;
}

export default function AppCard({ app, showFullDescription = false }: AppCardProps) {
  const { toast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="app-card hover-lift card-shadow">
      <CardContent className="p-6">
        <div className="flex items-start mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
            {app.logoUrl ? (
              <img 
                src={app.logoUrl} 
                alt={`${app.name} logo`}
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`text-white font-bold ${app.logoUrl ? 'hidden' : ''}`}>
              {app.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{app.name}</h3>
            <p className="text-sm text-gray-500 truncate">{app.developerName}</p>
            <Badge variant="secondary" className="mt-1">
              {app.category}
            </Badge>
          </div>
        </div>

        <p className={`text-gray-600 text-sm mb-4 ${showFullDescription ? '' : 'line-clamp-2'}`}>
          {app.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {renderStars(app.rating)}
            </div>
            <span className="text-sm text-gray-500">{app.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{app.downloads} downloads</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href={`/app/${app.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
            <Button 
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
