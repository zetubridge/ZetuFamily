import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { App } from "@shared/schema";
import { Link } from "wouter";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apps, isLoading, error } = useQuery({
    queryKey: ["/api/admin/apps"],
    select: (data) => data as App[],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.updateAppStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps"] });
      toast({
        title: "Status Updated",
        description: "App status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update app status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredApps = apps?.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.developerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusChange = (appId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: appId, status: newStatus });
  };

  const stats = {
    totalApps: apps?.length || 0,
    pendingApps: apps?.filter(app => app.status === "pending").length || 0,
    publishedApps: apps?.filter(app => app.status === "published").length || 0,
    rejectedApps: apps?.filter(app => app.status === "rejected").length || 0,
    totalDownloads: apps?.reduce((sum, app) => sum + app.downloads, 0) || 0,
    paidApps: apps?.filter(app => app.paymentStatus === "completed").length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" className="py-20" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              Failed to load admin dashboard. Please check your permissions and try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-roboto">Admin Dashboard</h1>
              <p className="text-gray-600">Manage app submissions and approvals</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.totalApps}</p>
                <p className="text-sm text-gray-600">Total Apps</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingApps}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.publishedApps}</p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.rejectedApps}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalDownloads}</p>
                <p className="text-sm text-gray-600">Downloads</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.paidApps}</p>
                <p className="text-sm text-gray-600">Paid Apps</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Medical Education">Medical Education</SelectItem>
                  <SelectItem value="Health Monitoring">Health Monitoring</SelectItem>
                  <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="Anatomy">Anatomy</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center text-sm text-gray-600">
                {filteredApps.length} of {apps?.length || 0} apps
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apps Table */}
        <Card>
          <CardHeader>
            <CardTitle>App Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Apps</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App Details</TableHead>
                        <TableHead>Developer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                {app.logoUrl ? (
                                  <img 
                                    src={app.logoUrl} 
                                    alt={`${app.name} logo`}
                                    className="w-8 h-8 rounded-md object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-medium text-sm">
                                    {app.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{app.name}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{app.developerName}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{app.category}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(app.paymentStatus)}</TableCell>
                          <TableCell>{app.downloads}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Link href={`/app/${app.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              
                              {app.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleStatusChange(app.id, "published")}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleStatusChange(app.id, "rejected")}
                                    disabled={updateStatusMutation.isPending}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              
                              {app.status === "published" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(app.id, "pending")}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <Clock className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {app.status === "rejected" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleStatusChange(app.id, "published")}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="pending">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App Details</TableHead>
                        <TableHead>Developer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.filter(app => app.status === "pending").map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                {app.logoUrl ? (
                                  <img 
                                    src={app.logoUrl} 
                                    alt={`${app.name} logo`}
                                    className="w-8 h-8 rounded-md object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-medium text-sm">
                                    {app.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{app.name}</p>
                                <p className="text-sm text-gray-500 line-clamp-2">{app.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{app.developerName}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{app.category}</Badge>
                          </TableCell>
                          <TableCell>{getPaymentStatusBadge(app.paymentStatus)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Link href={`/app/${app.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusChange(app.id, "published")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusChange(app.id, "rejected")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="published">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App Details</TableHead>
                        <TableHead>Developer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.filter(app => app.status === "published").map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                {app.logoUrl ? (
                                  <img 
                                    src={app.logoUrl} 
                                    alt={`${app.name} logo`}
                                    className="w-8 h-8 rounded-md object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-medium text-sm">
                                    {app.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{app.name}</p>
                                <p className="text-sm text-gray-500">
                                  Published {new Date(app.updatedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{app.developerName}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{app.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{app.downloads}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-sm font-medium">{app.rating.toFixed(1)}</span>
                              <span className="text-xs text-gray-500 ml-1">★</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Link href={`/app/${app.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(app.id, "pending")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Clock className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="rejected">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>App Details</TableHead>
                        <TableHead>Developer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Rejected Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApps.filter(app => app.status === "rejected").map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                {app.logoUrl ? (
                                  <img 
                                    src={app.logoUrl} 
                                    alt={`${app.name} logo`}
                                    className="w-8 h-8 rounded-md object-cover"
                                  />
                                ) : (
                                  <span className="text-white font-medium text-sm">
                                    {app.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{app.name}</p>
                                <p className="text-sm text-gray-500 line-clamp-2">{app.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{app.developerName}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{app.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {new Date(app.updatedAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Link href={`/app/${app.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusChange(app.id, "published")}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
