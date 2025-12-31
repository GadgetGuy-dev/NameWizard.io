import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Activity, Zap, AlertTriangle, Clock, Server, RefreshCw } from "lucide-react";

interface ApiMetric {
  id: number;
  provider: string;
  model: string;
  requestCount: number;
  successCount: number;
  errorCount: number;
  totalLatencyMs: number;
  lastUsed: string;
}

interface ProviderStats {
  provider: string;
  requests: number;
  successRate: number;
  avgLatency: number;
  errors: number;
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  xai: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  perplexity: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
};

export default function AdminApiMetricsPage() {
  const [, navigate] = useLocation();
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  const { data: currentUser, isLoading: userLoading } = useQuery<{
    id: number;
    role: "user" | "admin" | "god_admin";
  }>({
    queryKey: ["/api/auth/user"],
  });

  const { data: metrics, isLoading: metricsLoading, refetch } = useQuery<ApiMetric[]>({
    queryKey: ["/api/admin/api-metrics"],
    enabled: currentUser?.role === "god_admin" || currentUser?.role === "admin",
  });

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

  const providerStats: ProviderStats[] = [];
  const providers = new Set<string>();

  (metrics || []).forEach(m => {
    providers.add(m.provider);
    const existing = providerStats.find(s => s.provider === m.provider);
    if (existing) {
      existing.requests += m.requestCount;
      existing.errors += m.errorCount;
      existing.avgLatency = m.totalLatencyMs / Math.max(m.requestCount, 1);
    } else {
      providerStats.push({
        provider: m.provider,
        requests: m.requestCount,
        errors: m.errorCount,
        avgLatency: m.totalLatencyMs / Math.max(m.requestCount, 1),
        successRate: m.requestCount > 0 ? ((m.successCount / m.requestCount) * 100) : 0,
      });
    }
  });

  const filteredMetrics = (metrics || []).filter(
    m => selectedProvider === "all" || m.provider === selectedProvider
  );

  const totalRequests = providerStats.reduce((sum, s) => sum + s.requests, 0);
  const totalErrors = providerStats.reduce((sum, s) => sum + s.errors, 0);
  const overallSuccessRate = totalRequests > 0 ? (((totalRequests - totalErrors) / totalRequests) * 100).toFixed(1) : "0";
  const avgLatency = providerStats.length > 0 
    ? (providerStats.reduce((sum, s) => sum + s.avgLatency, 0) / providerStats.length).toFixed(0)
    : "0";

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="mr-4" data-testid="button-back">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-orange-500" />
            API Metrics Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor API provider performance and usage</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-500" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{overallSuccessRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Avg Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgLatency}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Total Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalErrors.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Performance</CardTitle>
            <CardDescription>Breakdown by AI provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {providerStats.length === 0 ? (
              <p className="text-muted-foreground text-sm">No API metrics recorded yet</p>
            ) : (
              providerStats.map((stat) => (
                <div key={stat.provider} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`provider-stat-${stat.provider}`}>
                  <div className="flex items-center gap-3">
                    <Badge className={PROVIDER_COLORS[stat.provider] || "bg-gray-100 text-gray-800"}>
                      {stat.provider}
                    </Badge>
                    <span className="text-sm">{stat.requests.toLocaleString()} requests</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">{stat.successRate.toFixed(1)}% success</span>
                    <span className="text-muted-foreground">{stat.avgLatency.toFixed(0)}ms avg</span>
                    {stat.errors > 0 && (
                      <span className="text-red-500">{stat.errors} errors</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Model Usage</CardTitle>
            <CardDescription>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-[180px]" data-testid="select-provider">
                  <SelectValue placeholder="Filter by provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {Array.from(providers).map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : filteredMetrics.length === 0 ? (
              <p className="text-muted-foreground text-sm">No model metrics available</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {filteredMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-2 border rounded" data-testid={`model-metric-${metric.id}`}>
                    <div>
                      <span className="font-medium text-sm">{metric.model}</span>
                      <p className="text-xs text-muted-foreground">{metric.provider}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{metric.requestCount} requests</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.requestCount > 0 
                          ? (metric.totalLatencyMs / metric.requestCount).toFixed(0)
                          : 0}ms avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
