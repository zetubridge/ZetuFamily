import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Download, Upload, Stethoscope, Heart, Pill, Brain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppCard from "@/components/AppCard";
import FeaturedApp from "@/components/FeaturedApp";
import { App } from "@shared/schema";
export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Use React Query with your queryClient's default queryFn
  const { data: apps, isLoading, error } = useQuery<App[]>({
    queryKey: ["/api/apps"],
  });

  // Filter apps based on search query
  const filteredApps = apps?.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Select featured app
  const featuredApp = apps?.find(app => app.name.toLowerCase().includes("med-a")) || apps?.[0];

  // Categories data
  const categories = [
    {
      name: "Medical Education",
      icon: Stethoscope,
      description: "Study materials and exam prep",
      color: "bg-blue-500"
    },
    {
      name: "Health Monitoring",
      icon: Heart,
      description: "Patient care and tracking",
      color: "bg-green-500"
    },
    {
      name: "Pharmacy",
      icon: Pill,
      description: "Drug reference and dosage",
      color: "bg-purple-500"
    },
    {
      name: "Anatomy",
      icon: Brain,
      description: "3D models and references",
      color: "bg-orange-500"
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />

      {/* Hero Section */}
      <section className="gradient-bg text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-roboto">
              Medical Apps for <span className="text-yellow-300">KMTC Students</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover and download essential medical education apps designed for Kenya Medical Training College students and medical professionals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => document.getElementById('apps-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
              >
                <Download className="w-4 h-4 mr-2" />
                Browse Apps
              </Button>
              <Link href="/publish">
                <Button
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Publish Your App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured App Section */}
      {featuredApp && <FeaturedApp app={featuredApp} />}

      {/* Categories Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-roboto">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find the perfect medical app for your studies</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.name} className="hover-lift card-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{category.name}</h3>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Apps Section */}
      <section id="apps-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-roboto">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Medical Apps"}
            </h2>
            {!searchQuery && (
              <Button variant="outline" className="text-blue-600 hover:text-blue-700">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Loading skeleton or spinner can go here */}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Failed to load apps. Please try again later.</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {searchQuery ? "No apps found matching your search." : "No apps available yet."}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Developer CTA Section */}
      <section className="py-16 gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 font-roboto">Publish Your Medical App</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Reach thousands of medical students and professionals in Kenya.
            Join our platform and make your app available to the medical community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center text-blue-100">
              <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
              <span>KES 1,000 one-time fee</span>
            </div>
            <div className="flex items-center text-blue-100">
              <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
              <span>Paystack secure payment</span>
            </div>
            <div className="flex items-center text-blue-100">
              <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
              <span>Quick approval process</span>
            </div>
          </div>
          <Link href="/publish">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3">
              <Upload className="w-4 h-4 mr-2" />
              Start Publishing
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}



