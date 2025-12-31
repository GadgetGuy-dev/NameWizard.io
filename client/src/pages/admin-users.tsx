import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Search, Users, Crown, Shield, User as UserIcon, RefreshCw } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin" | "god_admin";
  planType: "free" | "credits_low" | "credits_high" | "unlimited";
  createdAt: string;
  updatedAt: string;
}

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  credits_low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  credits_high: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  unlimited: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
};

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  credits_low: "Basic",
  credits_high: "Pro",
  unlimited: "Unlimited"
};

const ROLE_ICONS: Record<string, JSX.Element> = {
  user: <UserIcon className="h-4 w-4" />,
  admin: <Shield className="h-4 w-4 text-blue-500" />,
  god_admin: <Crown className="h-4 w-4 text-amber-500" />
};

export default function AdminUsersPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("all");

  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: users, isLoading: usersLoading, refetch } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: currentUser?.role === "god_admin" || currentUser?.role === "admin",
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ userId, planType }: { userId: number; planType: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PUT",
        body: JSON.stringify({ planType }),
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to update plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Plan updated", description: "User plan has been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update plan", variant: "destructive" });
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to update role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Role updated", description: "User role has been updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update role", variant: "destructive" });
    }
  });

  const isGodAdmin = currentUser?.role === "god_admin";

  if (userLoading) {
    return (
      <div className="container mx-auto py-10">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "god_admin")) {
    navigate("/");
    return null;
  }

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = selectedPlanFilter === "all" || user.planType === selectedPlanFilter;
    return matchesSearch && matchesPlan;
  });

  const planStats = {
    free: (users || []).filter(u => u.planType === "free").length,
    credits_low: (users || []).filter(u => u.planType === "credits_low").length,
    credits_high: (users || []).filter(u => u.planType === "credits_high").length,
    unlimited: (users || []).filter(u => u.planType === "unlimited").length,
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="mr-4" data-testid="button-back">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-orange-500" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage users, plans, and roles</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(planStats).map(([plan, count]) => (
          <Card key={plan} className="cursor-pointer hover:border-orange-500 transition-colors" onClick={() => setSelectedPlanFilter(plan)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{PLAN_LABELS[plan]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">users</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} of {(users || []).length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={selectedPlanFilter} onValueChange={setSelectedPlanFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-plan-filter">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="credits_low">Credits - Low</SelectItem>
                <SelectItem value="credits_high">Credits - High</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {usersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  {isGodAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {ROLE_ICONS[user.role]}
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {isGodAdmin && user.id !== currentUser?.id ? (
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateRoleMutation.mutate({ userId: user.id, role: value })}
                        >
                          <SelectTrigger className="w-[130px]" data-testid={`select-role-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="god_admin">God Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="capitalize">{user.role.replace("_", " ")}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isGodAdmin ? (
                        <Select
                          value={user.planType}
                          onValueChange={(value) => updatePlanMutation.mutate({ userId: user.id, planType: value })}
                        >
                          <SelectTrigger className="w-[150px]" data-testid={`select-plan-${user.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="credits_low">Credits - Low</SelectItem>
                            <SelectItem value="credits_high">Credits - High</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={PLAN_COLORS[user.planType]}>{PLAN_LABELS[user.planType]}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isGodAdmin && (
                      <TableCell>
                        <Button variant="ghost" size="sm" disabled data-testid={`button-view-${user.id}`}>
                          View Details
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
