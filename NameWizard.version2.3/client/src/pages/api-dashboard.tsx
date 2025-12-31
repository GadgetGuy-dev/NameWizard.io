import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LayoutDashboard, Key, Activity, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'wouter';

const ApiDashboard = () => {
  const stats = {
    totalProviders: 12,
    activeProviders: 4,
    totalUsage: 45230,
    totalCost: 12.45,
    alerts: 2,
    uptime: 99.8
  };

  const providerStats = [
    { name: 'OpenAI', usage: 35000, limit: 100000, cost: 8.50, status: 'active' },
    { name: 'Anthropic', usage: 8000, limit: 50000, cost: 2.40, status: 'active' },
    { name: 'Google Gemini', usage: 2230, limit: 60000, cost: 1.55, status: 'active' },
    { name: 'TechVision OCR', usage: 450, limit: 10000, cost: 0.45, status: 'active' },
  ];

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">API Key Dashboard</h1>
            <p className="text-zinc-400">Overview of all your API providers and usage</p>
          </div>
        </div>
        <Link href="/api-keys">
          <Button variant="outline" className="border-orange-500 text-orange-400">
            <Key className="w-4 h-4 mr-2" /> Manage Keys
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-500 mb-1">Total Providers</p>
            <p className="text-2xl font-bold text-orange-400">{stats.totalProviders}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-400">{stats.activeProviders}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-500 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-orange-400">{stats.totalUsage.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-500 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-green-400">${stats.totalCost}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-500 mb-1">Alerts</p>
            <p className="text-2xl font-bold text-red-400">{stats.alerts}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-xs text-zinc-500 mb-1">Uptime</p>
            <p className="text-2xl font-bold text-green-400">{stats.uptime}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 mb-8">
        <CardHeader>
          <CardTitle className="text-orange-400">Provider Usage Overview</CardTitle>
          <CardDescription>Current usage across all active providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {providerStats.map(provider => (
            <div key={provider.name} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-orange-200">{provider.name}</span>
                  <Badge className="bg-green-500/20 text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </Badge>
                </div>
                <span className="text-green-400 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> ${provider.cost.toFixed(2)}
                </span>
              </div>
              <Progress value={(provider.usage / provider.limit) * 100} className="h-2" />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-500">
                <span>{provider.usage.toLocaleString()} / {provider.limit.toLocaleString()} requests</span>
                <span>{((provider.usage / provider.limit) * 100).toFixed(1)}% used</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="bg-zinc-800/50 border border-dashed border-zinc-600 rounded-lg p-12 text-center">
        <LayoutDashboard className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl text-zinc-400 mb-2">Dashboard Customization Coming Soon</h3>
        <p className="text-zinc-500">You'll be able to customize this dashboard with widgets and charts.</p>
        <p className="text-zinc-500 text-sm mt-2">Provide a screenshot to design the layout you want.</p>
      </div>
    </div>
  );
};

export default ApiDashboard;
