import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import DocumentSegmentManager from "@/components/document-segments/DocumentSegmentManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Shield, UsersRound, Database, FileText, Activity, Settings, BarChart3, Server, Key } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const [location, navigate] = useLocation();
  const { data: user, isLoading } = useQuery<{
    id: number;
    username: string;
    fullName?: string;
    email: string;
    role: "user" | "admin" | "god_admin";
  }>({
    queryKey: ["/api/auth/user"],
  });

  // Check if user is admin
  const isAdmin = user?.role === "admin" || user?.role === "god_admin";
  const isGodAdmin = user?.role === "god_admin";

  // Redirect to auth if not logged in or to home if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, isLoading, navigate, isAdmin]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="mr-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user.fullName || user.username}. You have{" "}
            {isGodAdmin ? "God Admin" : "Admin"} privileges.
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          {isGodAdmin && (
            <TabsTrigger value="document-segments">Document Segments</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/admin/users">
              <Card className="cursor-pointer hover:border-orange-500 transition-colors" data-testid="card-admin-users">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <UsersRound className="mr-2 h-5 w-5 text-orange-500" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage users, plans, and roles</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/api-metrics">
              <Card className="cursor-pointer hover:border-orange-500 transition-colors" data-testid="card-admin-metrics">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="mr-2 h-5 w-5 text-orange-500" />
                    API Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Monitor provider performance</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/system-status">
              <Card className="cursor-pointer hover:border-orange-500 transition-colors" data-testid="card-admin-status">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Server className="mr-2 h-5 w-5 text-orange-500" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">View service health and alerts</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/api-management">
              <Card className="cursor-pointer hover:border-orange-500 transition-colors" data-testid="card-admin-api">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Key className="mr-2 h-5 w-5 text-orange-500" />
                    API Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Configure API keys and providers</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Shield className="mr-2 h-5 w-5 text-orange-500" />
                  Access Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Your admin level:</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isGodAdmin ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {isGodAdmin ? "God Admin" : "Admin"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="mr-2 h-5 w-5 text-green-500" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-500">Operational</p>
                <p className="text-sm text-muted-foreground">All services running</p>
              </CardContent>
            </Card>

            {isGodAdmin && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Database className="mr-2 h-5 w-5 text-purple-500" />
                    Document Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage document templates</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardHeader>
                <CardTitle>System Activity Log</CardTitle>
                <CardDescription>
                  Recent administrative actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No recent activity to display</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <UsersRound className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>User management module coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isGodAdmin && (
          <TabsContent value="document-segments">
            <DocumentSegmentManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}