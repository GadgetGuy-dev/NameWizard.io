import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LayoutDashboard, Key, AlertCircle, CheckCircle, Settings, 
  DollarSign, Activity, Shield, ExternalLink, Copy, Eye, EyeOff,
  Zap, TrendingUp, Clock, AlertTriangle, Info, ChevronRight,
  RefreshCw, Play, XCircle, HelpCircle, BookOpen, Sparkles
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

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

interface ProviderHealth {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  latency?: number;
  lastChecked?: string;
  errorMessage?: string;
  category: 'ai' | 'ocr' | 'cloud';
}

interface SystemHealth {
  providers: { total: number; active: number; ai: number; cloud: number; ocr: number };
  alertCount: number;
  alerts?: Array<{ type: string; message: string; provider?: string; severity: 'info' | 'warning' | 'error' }>;
}

interface CostEstimate {
  provider: string;
  model: string;
  costPer1kTokens: number;
  estimatedMonthlyCost: number;
  usage: number;
}

const PROVIDER_GUIDES: Record<string, { 
  name: string; 
  steps: string[]; 
  link: string; 
  keyFormat: string;
  tips: string[];
}> = {
  openai: {
    name: 'OpenAI',
    steps: [
      'Go to platform.openai.com and sign in or create an account',
      'Navigate to API Keys section in your account settings',
      'Click "Create new secret key" and give it a name',
      'Copy the key immediately (it won\'t be shown again)',
      'Paste the key in the field below'
    ],
    link: 'https://platform.openai.com/api-keys',
    keyFormat: 'sk-...',
    tips: [
      'Set a spending limit to avoid unexpected charges',
      'GPT-4o offers the best balance of quality and cost',
      'Consider using GPT-3.5 for high-volume, simple renames'
    ]
  },
  meta: {
    name: 'Meta (Llama)',
    steps: [
      'Visit an OpenRouter or Replicate provider',
      'Sign up and verify your account',
      'Navigate to the API Keys section',
      'Generate a new API key',
      'Paste the key in the field below'
    ],
    link: 'https://openrouter.ai/keys',
    keyFormat: 'Standard API key format',
    tips: [
      'Llama models are cost-effective fallbacks',
      'Good for high-volume simple tasks',
      'Fast inference times'
    ]
  },
  google: {
    name: 'Google (Gemini)',
    steps: [
      'Go to Google AI Studio (aistudio.google.com)',
      'Sign in with your Google account',
      'Click "Get API Key" in the left sidebar',
      'Create a new API key or use an existing one',
      'Copy and paste the key below'
    ],
    link: 'https://aistudio.google.com/app/apikey',
    keyFormat: 'AIza...',
    tips: [
      'Gemini Pro offers excellent value for the price',
      'Great for image analysis and OCR tasks',
      'Free tier available for testing'
    ]
  },
  mistral: {
    name: 'Mistral AI',
    steps: [
      'Visit console.mistral.ai and sign up',
      'Navigate to API Keys section',
      'Generate a new API key',
      'Copy the key and paste below'
    ],
    link: 'https://console.mistral.ai/api-keys/',
    keyFormat: 'Standard API key format',
    tips: [
      'Mistral offers competitive pricing',
      'Good for European data residency requirements',
      'Fast inference speeds'
    ]
  },
  'google-vision': {
    name: 'Google Cloud Vision',
    steps: [
      'Go to Google Cloud Console (console.cloud.google.com)',
      'Create a new project or select existing one',
      'Enable the Cloud Vision API',
      'Create credentials (API Key)',
      'Copy and paste the key below'
    ],
    link: 'https://console.cloud.google.com/apis/library/vision.googleapis.com',
    keyFormat: 'AIza...',
    tips: [
      'Highly accurate OCR for printed text',
      'Supports 50+ languages',
      'Good for document and receipt scanning'
    ]
  },
  'aws-textract': {
    name: 'AWS Textract',
    steps: [
      'Sign into AWS Console',
      'Navigate to IAM and create a new user',
      'Attach the AmazonTextractFullAccess policy',
      'Generate access key credentials',
      'Enter the Access Key ID below'
    ],
    link: 'https://console.aws.amazon.com/textract/',
    keyFormat: 'AKIA...',
    tips: [
      'Excellent for forms and tables',
      'Best for structured document extraction',
      'Integrates with other AWS services'
    ]
  }
};

const COST_ESTIMATES: Record<string, { per1kInput: number; per1kOutput: number; displayName: string; category: 'ai' | 'ocr' }> = {
  'gpt-5-nano': { per1kInput: 0.0001, per1kOutput: 0.0004, displayName: 'GPT-5 Nano', category: 'ai' },
  'gpt-5.2': { per1kInput: 0.002, per1kOutput: 0.008, displayName: 'GPT-5.2', category: 'ai' },
  'gemini-2.5-flash': { per1kInput: 0.0005, per1kOutput: 0.002, displayName: 'Gemini 2.5 Flash', category: 'ai' },
  'mistral-small-2025': { per1kInput: 0.0002, per1kOutput: 0.0006, displayName: 'Mistral Small 2025', category: 'ai' },
  'llama-3.1-small': { per1kInput: 0.0001, per1kOutput: 0.0002, displayName: 'Llama 3.1 Small', category: 'ai' },
  'google-vision': { per1kInput: 0.0015, per1kOutput: 0, displayName: 'Google Cloud Vision', category: 'ocr' },
  'google-vision-lite': { per1kInput: 0.001, per1kOutput: 0, displayName: 'Google Vision Lite', category: 'ocr' },
  'google-vision-advanced': { per1kInput: 0.002, per1kOutput: 0, displayName: 'Google Vision Advanced', category: 'ocr' },
  'aws-textract': { per1kInput: 0.0025, per1kOutput: 0, displayName: 'AWS Textract', category: 'ocr' },
  'azure-vision': { per1kInput: 0.001, per1kOutput: 0, displayName: 'Azure Computer Vision', category: 'ocr' },
  'azure-vision-lite': { per1kInput: 0.001, per1kOutput: 0, displayName: 'Azure Vision Lite', category: 'ocr' },
  'azure-vision-advanced': { per1kInput: 0.002, per1kOutput: 0, displayName: 'Azure Vision Advanced', category: 'ocr' },
  'techvision': { per1kInput: 0.0005, per1kOutput: 0, displayName: 'TechVision OCR', category: 'ocr' }
};

const PROVIDER_MODEL_MAP: Record<string, string> = {
  'openai': 'gpt-5.2',
  'google': 'gemini-2.5-flash',
  'gemini': 'gemini-2.5-flash',
  'mistral': 'mistral-small-2025',
  'meta': 'llama-3.1-small',
  'llama': 'llama-3.1-small',
  'openrouter': 'gpt-5.2',
  'gpt-5-nano': 'gpt-5-nano',
  'gpt-5.2': 'gpt-5.2',
  'gpt 5 nano': 'gpt-5-nano',
  'gpt 5.2': 'gpt-5.2',
  'gemini-2.5-flash': 'gemini-2.5-flash',
  'gemini 2.5 flash': 'gemini-2.5-flash',
  'mistral-small-2025': 'mistral-small-2025',
  'mistral small 2025': 'mistral-small-2025',
  'mistral small': 'mistral-small-2025',
  'llama-3.1-small': 'llama-3.1-small',
  'llama 3.1 small': 'llama-3.1-small',
  'llama-3.1': 'llama-3.1-small',
  'google-vision': 'google-vision',
  'google cloud vision': 'google-vision',
  'googlevision': 'google-vision',
  'google-vision-lite': 'google-vision-lite',
  'google-vision-advanced': 'google-vision-advanced',
  'vision': 'google-vision',
  'aws-textract': 'aws-textract',
  'textract': 'aws-textract',
  'amazon textract': 'aws-textract',
  'azure-vision': 'azure-vision',
  'azure computer vision': 'azure-vision',
  'azurevision': 'azure-vision',
  'azure-vision-lite': 'azure-vision-lite',
  'azure-vision-advanced': 'azure-vision-advanced',
  'techvision': 'techvision',
  'tech vision': 'techvision'
};

const ApiDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'info' | 'warning' | 'error'; message: string; provider?: string }>>([]);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testDialogProvider, setTestDialogProvider] = useState<string | null>(null);
  const [testApiKey, setTestApiKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  const { data: currentUser, isLoading: userLoading } = useQuery<{ id: number; role: string }>({
    queryKey: ['/api/auth/user'],
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'god_admin';

  const { data: metrics, isLoading: metricsLoading } = useQuery<ApiMetric[]>({
    queryKey: ['/api/admin/api-metrics'],
    enabled: isAdmin,
  });

  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery<SystemHealth>({
    queryKey: ['/api/system/health'],
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const { data: providers } = useQuery<ProviderHealth[]>({
    queryKey: ['/api/admin/providers-health'],
    enabled: isAdmin,
  });

  const testKeyMutation = useMutation({
    mutationFn: async ({ type, key }: { type: string; key: string }) => {
      const response = await apiRequest('POST', '/api/validate-api-key', { type, key });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setTestResult({ success: data.success, message: data.message || 'Validation successful', latency: data.latency });
      if (data.success) {
        toast({
          title: 'API Key Valid',
          description: `${variables.type} key validated successfully (${data.latency}ms)`,
        });
        addNotification('info', `${variables.type} API key validated successfully`, variables.type);
      } else {
        toast({
          title: 'Validation Failed',
          description: data.message,
          variant: 'destructive',
        });
        addNotification('error', data.message, variables.type);
      }
      setTestingProvider(null);
    },
    onError: (error: any) => {
      setTestResult({ success: false, message: error.message || 'Test failed' });
      toast({
        title: 'Test Failed',
        description: error.message,
        variant: 'destructive',
      });
      setTestingProvider(null);
    }
  });

  const mapProviderToType = (providerName: string): string => {
    const name = providerName.toLowerCase();
    if (name.includes('openai') || name.includes('gpt')) return 'openai';
    if (name.includes('anthropic') || name.includes('claude')) return 'anthropic';
    if (name.includes('gemini')) return 'google';
    if (name.includes('google') && (name.includes('vision') || name.includes('ocr'))) return 'google-vision';
    if (name.includes('google')) return 'google';
    if (name.includes('mistral')) return 'mistral';
    if (name.includes('perplexity')) return 'perplexity';
    if (name.includes('xai') || name.includes('grok')) return 'xai';
    if (name.includes('openrouter')) return 'openrouter';
    if (name.includes('ollama')) return 'ollama';
    if (name.includes('textract') || name.includes('aws')) return 'aws-textract';
    if (name.includes('azure')) return 'azure-vision';
    if (name.includes('techvision')) return 'techvision';
    return 'openai';
  };

  const openTestDialog = (providerName: string) => {
    setTestDialogProvider(providerName);
    setTestApiKey('');
    setTestResult(null);
    setTestDialogOpen(true);
  };

  const runTest = () => {
    if (!testDialogProvider || !testApiKey.trim()) return;
    const type = mapProviderToType(testDialogProvider);
    setTestingProvider(testDialogProvider);
    testKeyMutation.mutate({ type, key: testApiKey.trim() });
  };

  const isLoading = metricsLoading || healthLoading;

  const providerStats = (metrics || []).reduce((acc, m) => {
    const existing = acc.find(p => p.name === m.provider);
    if (existing) {
      existing.usage += m.requestCount;
      existing.successCount += m.successCount;
      existing.errorCount += m.errorCount;
      existing.totalLatency += m.totalLatencyMs;
    } else {
      acc.push({
        name: m.provider,
        usage: m.requestCount,
        successCount: m.successCount,
        errorCount: m.errorCount,
        totalLatency: m.totalLatencyMs,
        status: 'active' as const
      });
    }
    return acc;
  }, [] as { name: string; usage: number; successCount: number; errorCount: number; totalLatency: number; status: 'active' }[]);

  const totalRequests = providerStats.reduce((sum, p) => sum + p.usage, 0);
  const totalErrors = providerStats.reduce((sum, p) => sum + p.errorCount, 0);
  const successRate = totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests * 100).toFixed(1) : '0';

  const hasData = (metrics && metrics.length > 0) || (health?.providers?.active || 0) > 0;

  const addNotification = (type: 'info' | 'warning' | 'error', message: string, provider?: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev.slice(-4), { id, type, message, provider }]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (health?.alerts && health.alerts.length > 0) {
      health.alerts.forEach(alert => {
        if (!notifications.find(n => n.message === alert.message)) {
          addNotification(alert.severity, alert.message, alert.provider);
        }
      });
    }
  }, [health?.alerts]);

  useEffect(() => {
    providerStats.forEach(provider => {
      if (provider.errorCount > 0 && provider.errorCount / provider.usage > 0.1) {
        const msg = `${provider.name} has a ${((provider.errorCount / provider.usage) * 100).toFixed(0)}% error rate`;
        if (!notifications.find(n => n.message === msg)) {
          addNotification('warning', msg, provider.name);
        }
      }
      if (provider.totalLatency / provider.usage > 3000) {
        const msg = `${provider.name} average latency is high (${(provider.totalLatency / provider.usage).toFixed(0)}ms)`;
        if (!notifications.find(n => n.message === msg)) {
          addNotification('warning', msg, provider.name);
        }
      }
    });
  }, [providerStats]);

  const getProviderCost = (providerName: string) => {
    const normalizedName = providerName.toLowerCase().trim();
    
    if (PROVIDER_MODEL_MAP[normalizedName]) {
      return COST_ESTIMATES[PROVIDER_MODEL_MAP[normalizedName]] || COST_ESTIMATES['gpt-4o'];
    }
    
    if (normalizedName.includes('azure') && normalizedName.includes('vision')) return COST_ESTIMATES['azure-vision'];
    if (normalizedName.includes('azure')) return COST_ESTIMATES['azure-vision'];
    if (normalizedName.includes('textract')) return COST_ESTIMATES['aws-textract'];
    if (normalizedName.includes('aws')) return COST_ESTIMATES['aws-textract'];
    if (normalizedName.includes('techvision')) return COST_ESTIMATES['techvision'];
    if (normalizedName.includes('google') && (normalizedName.includes('vision') || normalizedName.includes('ocr'))) return COST_ESTIMATES['google-vision'];
    
    if (normalizedName.includes('gpt-4o') || normalizedName.includes('gpt4o')) return COST_ESTIMATES['gpt-4o'];
    if (normalizedName.includes('gpt-4') || normalizedName.includes('gpt4')) return COST_ESTIMATES['gpt-4-turbo'];
    if (normalizedName.includes('gpt-3.5') || normalizedName.includes('gpt3.5')) return COST_ESTIMATES['gpt-3.5-turbo'];
    if (normalizedName.includes('claude') && normalizedName.includes('opus')) return COST_ESTIMATES['claude-3-opus'];
    if (normalizedName.includes('claude') && normalizedName.includes('sonnet')) return COST_ESTIMATES['claude-3-5-sonnet'];
    if (normalizedName.includes('claude') && normalizedName.includes('haiku')) return COST_ESTIMATES['gpt-3.5-turbo'];
    if (normalizedName.includes('claude')) return COST_ESTIMATES['claude-3-5-sonnet'];
    if (normalizedName.includes('gemini') && normalizedName.includes('flash')) return COST_ESTIMATES['gemini-1.5-flash'];
    if (normalizedName.includes('gemini')) return COST_ESTIMATES['gemini-1.5-pro'];
    if (normalizedName.includes('mistral')) return COST_ESTIMATES['mistral-large'];
    if (normalizedName.includes('llama')) return COST_ESTIMATES['llama-3-70b'];
    if (normalizedName.includes('openai')) return COST_ESTIMATES['gpt-4o'];
    if (normalizedName.includes('anthropic')) return COST_ESTIMATES['claude-3-5-sonnet'];
    if (normalizedName.includes('google')) return COST_ESTIMATES['gemini-1.5-pro'];
    if (normalizedName.includes('perplexity')) return COST_ESTIMATES['llama-3-70b'];
    if (normalizedName.includes('xai') || normalizedName.includes('grok')) return COST_ESTIMATES['gpt-4o'];
    if (normalizedName.includes('openrouter')) return COST_ESTIMATES['gpt-4o'];
    if (normalizedName.includes('ollama')) return COST_ESTIMATES['llama-3-70b'];
    
    return COST_ESTIMATES['gpt-4o'];
  };

  const estimateMonthlyCost = () => {
    let totalCost = 0;
    const avgTokensPerRequest = 500;
    
    providerStats.forEach(provider => {
      const cost = getProviderCost(provider.name);
      if (cost.category === 'ocr') {
        totalCost += provider.usage * cost.per1kInput;
      } else {
        const estimatedTokens = provider.usage * avgTokensPerRequest;
        totalCost += (estimatedTokens / 1000) * (cost.per1kInput + cost.per1kOutput) / 2;
      }
    });
    return totalCost;
  };

  if (userLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">API Health Dashboard</h1>
            <p className="text-zinc-400">Complete overview of your API providers, costs, and diagnostics</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">API Health Dashboard</h1>
            <p className="text-zinc-400">Complete overview of your API providers, costs, and diagnostics</p>
          </div>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg text-zinc-400 mb-2">Sign In Required</h3>
            <p className="text-zinc-500 text-sm mb-4">Please sign in to view your API dashboard.</p>
            <Link href="/auth">
              <Button variant="outline" className="border-orange-500 text-orange-400">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <LayoutDashboard className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">API Health Dashboard</h1>
            <p className="text-zinc-400">Complete overview of your API providers, costs, and diagnostics</p>
          </div>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-8 pb-8 text-center">
            <Settings className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg text-zinc-400 mb-2">Manage Your API Keys</h3>
            <p className="text-zinc-500 text-sm mb-4">Configure your own API keys to enable AI-powered file renaming.</p>
            <Link href="/api-keys">
              <Button variant="outline" className="border-orange-500 text-orange-400">
                <Key className="w-4 h-4 mr-2" /> Configure API Keys
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm" data-testid="notification-container">
          {notifications.map(notification => (
            <Alert 
              key={notification.id} 
              variant={notification.type === 'error' ? 'destructive' : 'default'}
              className={`${
                notification.type === 'warning' ? 'border-yellow-500 bg-yellow-500/10' :
                notification.type === 'info' ? 'border-blue-500 bg-blue-500/10' :
                'border-red-500 bg-red-500/10'
              } animate-in slide-in-from-right`}
              data-testid={`notification-${notification.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  {notification.type === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
                  {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                  {notification.type === 'info' && <Info className="h-4 w-4 text-blue-400" />}
                  <div>
                    {notification.provider && (
                      <AlertTitle className="text-sm font-medium">{notification.provider}</AlertTitle>
                    )}
                    <AlertDescription className="text-xs">{notification.message}</AlertDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => dismissNotification(notification.id)}
                  data-testid={`dismiss-notification-${notification.id}`}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">API Health Dashboard</h1>
            <p className="text-zinc-400">Complete overview of your API providers, costs, and diagnostics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetchHealth()}
            className="border-zinc-700"
            data-testid="refresh-health"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Link href="/admin/api-management">
            <Button variant="outline" className="border-orange-500 text-orange-400" data-testid="manage-keys-link">
              <Key className="w-4 h-4 mr-2" /> Manage Keys
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-zinc-800 border border-zinc-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500" data-testid="tab-overview">
            <Activity className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="configuration" className="data-[state=active]:bg-orange-500" data-testid="tab-configuration">
            <Settings className="w-4 h-4 mr-2" /> Configuration
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-orange-500" data-testid="tab-costs">
            <DollarSign className="w-4 h-4 mr-2" /> Cost Analysis
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="data-[state=active]:bg-orange-500" data-testid="tab-diagnostics">
            <Zap className="w-4 h-4 mr-2" /> Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Active Providers</p>
                    <p className="text-2xl font-bold text-green-400">{health?.providers?.active || 0}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${(health?.providers?.active || 0) > 0 ? 'bg-green-500' : 'bg-zinc-600'}`} />
                </div>
                <p className="text-xs text-zinc-500 mt-1">of {health?.providers?.total || 0} configured</p>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Total Requests</p>
                    <p className="text-2xl font-bold text-orange-400">{totalRequests.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-xs text-zinc-500 mt-1">All time</p>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Success Rate</p>
                    <p className={`text-2xl font-bold ${parseFloat(successRate) >= 95 ? 'text-green-400' : parseFloat(successRate) >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {successRate}%
                    </p>
                  </div>
                  <CheckCircle className={`w-5 h-5 ${parseFloat(successRate) >= 95 ? 'text-green-400' : 'text-yellow-400'}`} />
                </div>
                <Progress value={parseFloat(successRate)} className="mt-2 h-1" />
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Est. Monthly Cost</p>
                    <p className="text-2xl font-bold text-orange-400">${estimateMonthlyCost().toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-xs text-zinc-500 mt-1">Based on usage</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">Provider Status</CardTitle>
              <CardDescription>Real-time health of all configured providers</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasData ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg text-zinc-400 mb-2">No Providers Configured</h3>
                  <p className="text-zinc-500 text-sm mb-4">
                    Add API keys to start using AI-powered file renaming.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-orange-500 text-orange-400"
                    onClick={() => setActiveTab('configuration')}
                    data-testid="goto-configuration"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Configure Providers
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {providerStats.map(provider => (
                    <div key={provider.name} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700" data-testid={`provider-status-${provider.name}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            provider.errorCount / provider.usage > 0.1 ? 'bg-red-500' :
                            provider.totalLatency / provider.usage > 2000 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="font-medium text-orange-200">{provider.name}</span>
                          <Badge className={`${
                            provider.errorCount / provider.usage > 0.1 ? 'bg-red-500/20 text-red-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {provider.errorCount / provider.usage > 0.1 ? 'Issues' : 'Healthy'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-zinc-400">{provider.usage.toLocaleString()} requests</span>
                          <span className="text-zinc-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {provider.usage > 0 ? Math.round(provider.totalLatency / provider.usage) : 0}ms avg
                          </span>
                          {provider.errorCount > 0 && (
                            <span className="text-red-400">{provider.errorCount} errors</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Provider Setup Guides
              </CardTitle>
              <CardDescription>Step-by-step instructions for configuring each API provider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(PROVIDER_GUIDES).map(([key, guide]) => (
                <div 
                  key={key} 
                  className="border border-zinc-700 rounded-lg overflow-hidden"
                  data-testid={`guide-${key}`}
                >
                  <button
                    className="w-full p-4 flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
                    onClick={() => setExpandedGuide(expandedGuide === key ? null : key)}
                    data-testid={`guide-toggle-${key}`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      <span className="font-medium text-orange-200">{guide.name}</span>
                      <Badge variant="outline" className="text-xs">{guide.keyFormat}</Badge>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-zinc-400 transition-transform ${expandedGuide === key ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {expandedGuide === key && (
                    <div className="p-4 bg-zinc-900 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-zinc-300 mb-2">Setup Steps:</h4>
                        <ol className="space-y-2">
                          {guide.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-xs flex items-center justify-center">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-orange-500 text-orange-400"
                          onClick={() => window.open(guide.link, '_blank')}
                          data-testid={`guide-link-${key}`}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" /> Open Provider Dashboard
                        </Button>
                      </div>
                      
                      <div className="bg-zinc-800/50 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" /> Pro Tips
                        </h4>
                        <ul className="space-y-1">
                          {guide.tips.map((tip, i) => (
                            <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                              <span className="text-orange-400">•</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Link href="/admin/api-management">
              <Button className="bg-orange-500 hover:bg-orange-600" data-testid="full-api-management">
                <Key className="w-4 h-4 mr-2" /> Open Full API Management
              </Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <p className="text-xs text-zinc-500 mb-1">Estimated This Month</p>
                <p className="text-3xl font-bold text-orange-400">${estimateMonthlyCost().toFixed(2)}</p>
                <p className="text-xs text-zinc-500 mt-1">Based on current usage patterns</p>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <p className="text-xs text-zinc-500 mb-1">Avg Cost Per Rename</p>
                <p className="text-3xl font-bold text-orange-400">
                  ${totalRequests > 0 ? (estimateMonthlyCost() / totalRequests).toFixed(4) : '0.00'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Across all providers</p>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4">
                <p className="text-xs text-zinc-500 mb-1">Most Economical</p>
                <p className="text-xl font-bold text-green-400">
                  {providerStats.length > 0 ? providerStats[0].name : 'N/A'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">Best value for your usage</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">Cost Breakdown by Provider</CardTitle>
              <CardDescription>Estimated costs based on your usage and current pricing</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasData ? (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg text-zinc-400 mb-2">No Usage Data</h3>
                  <p className="text-zinc-500 text-sm">Start renaming files to see cost analysis.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {providerStats.map(provider => {
                    const cost = getProviderCost(provider.name);
                    const avgTokens = 500;
                    const isOCR = cost.category === 'ocr';
                    const estimatedCost = isOCR 
                      ? provider.usage * cost.per1kInput 
                      : (provider.usage * avgTokens / 1000) * (cost.per1kInput + cost.per1kOutput) / 2;
                    const modelName = PROVIDER_MODEL_MAP[provider.name.toLowerCase()] || 'gpt-4o';
                    
                    return (
                      <div key={provider.name} className={`p-4 bg-zinc-800/50 rounded-lg border ${isOCR ? 'border-blue-900/50' : 'border-zinc-700'}`} data-testid={`cost-${provider.name}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isOCR ? 'text-blue-200' : 'text-orange-200'}`}>{provider.name}</span>
                            <Badge variant="outline" className={`text-xs ${isOCR ? 'border-blue-700 text-blue-300' : ''}`}>
                              {COST_ESTIMATES[modelName]?.displayName || modelName}
                            </Badge>
                            {isOCR && <Badge className="bg-blue-500/20 text-blue-400 text-xs">OCR</Badge>}
                          </div>
                          <span className={`text-xl font-bold ${isOCR ? 'text-blue-400' : 'text-orange-400'}`}>${estimatedCost.toFixed(4)}</span>
                        </div>
                        {isOCR ? (
                          <div className="grid grid-cols-3 gap-4 text-xs text-zinc-500">
                            <div>
                              <p>Pages Processed</p>
                              <p className="text-zinc-300">{provider.usage.toLocaleString()}</p>
                            </div>
                            <div>
                              <p>Cost Per Page</p>
                              <p className="text-zinc-300">${cost.per1kInput.toFixed(4)}</p>
                            </div>
                            <div>
                              <p>Total Cost</p>
                              <p className="text-blue-300">${estimatedCost.toFixed(4)}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-4 text-xs text-zinc-500">
                            <div>
                              <p>Requests</p>
                              <p className="text-zinc-300">{provider.usage.toLocaleString()}</p>
                            </div>
                            <div>
                              <p>Est. Tokens</p>
                              <p className="text-zinc-300">{(provider.usage * avgTokens).toLocaleString()}</p>
                            </div>
                            <div>
                              <p>Input Cost</p>
                              <p className="text-zinc-300">${cost.per1kInput}/1K</p>
                            </div>
                            <div>
                              <p>Output Cost</p>
                              <p className="text-zinc-300">${cost.per1kOutput}/1K</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">Model Pricing Reference</CardTitle>
              <CardDescription>Current pricing for supported AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">AI Language Models</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(COST_ESTIMATES).filter(([_, p]) => p.category === 'ai').map(([model, pricing]) => (
                      <div key={model} className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700" data-testid={`pricing-${model}`}>
                        <p className="font-medium text-orange-200 text-sm mb-1">{pricing.displayName}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Input:</span>
                          <span className="text-zinc-300">${pricing.per1kInput}/1K tokens</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Output:</span>
                          <span className="text-zinc-300">${pricing.per1kOutput}/1K tokens</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1 pt-1 border-t border-zinc-700">
                          <span className="text-zinc-500">Est. per rename:</span>
                          <span className="text-orange-300">~${((500/1000) * (pricing.per1kInput + pricing.per1kOutput) / 2).toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">OCR Providers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(COST_ESTIMATES).filter(([_, p]) => p.category === 'ocr').map(([model, pricing]) => (
                      <div key={model} className="p-3 bg-zinc-800/50 rounded-lg border border-blue-900/50" data-testid={`pricing-${model}`}>
                        <p className="font-medium text-blue-200 text-sm mb-1">{pricing.displayName}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Per page:</span>
                          <span className="text-zinc-300">${pricing.per1kInput.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1 pt-1 border-t border-zinc-700">
                          <span className="text-zinc-500">Est. per file:</span>
                          <span className="text-blue-300">~${pricing.per1kInput.toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">API Response Checker</CardTitle>
              <CardDescription>Test API connections and verify response formats</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasData ? (
                <div className="text-center py-12">
                  <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg text-zinc-400 mb-2">No Providers to Test</h3>
                  <p className="text-zinc-500 text-sm mb-4">Configure API keys first to run diagnostics.</p>
                  <Button 
                    variant="outline" 
                    className="border-orange-500 text-orange-400"
                    onClick={() => setActiveTab('configuration')}
                    data-testid="goto-config-from-diag"
                  >
                    <Settings className="w-4 h-4 mr-2" /> Configure Providers
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {providerStats.map(provider => (
                    <div key={provider.name} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700" data-testid={`diagnostic-${provider.name}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            testingProvider === provider.name ? 'bg-orange-500 animate-pulse' :
                            provider.errorCount === 0 ? 'bg-green-500' :
                            provider.errorCount / provider.usage < 0.1 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-orange-200">{provider.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            provider.errorCount === 0 ? 'bg-green-500/20 text-green-400' :
                            provider.errorCount / provider.usage < 0.1 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {provider.errorCount === 0 ? 'Passing' : 
                             provider.errorCount / provider.usage < 0.1 ? 'Minor Issues' : 'Failing'}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={testingProvider !== null}
                            className="border-zinc-600"
                            onClick={() => openTestDialog(provider.name)}
                            data-testid={`test-provider-${provider.name}`}
                          >
                            {testingProvider === provider.name ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" /> Test
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-zinc-500">Success Rate</p>
                          <p className={`font-medium ${
                            (provider.successCount / provider.usage) >= 0.95 ? 'text-green-400' :
                            (provider.successCount / provider.usage) >= 0.8 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {provider.usage > 0 ? ((provider.successCount / provider.usage) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Avg Latency</p>
                          <p className={`font-medium ${
                            (provider.totalLatency / provider.usage) < 1000 ? 'text-green-400' :
                            (provider.totalLatency / provider.usage) < 2000 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {provider.usage > 0 ? Math.round(provider.totalLatency / provider.usage) : 0}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Total Errors</p>
                          <p className={`font-medium ${provider.errorCount === 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {provider.errorCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Last Used</p>
                          <p className="text-zinc-300">Recently</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">System Health Check</CardTitle>
              <CardDescription>Overall system status and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${(health?.providers?.active || 0) > 0 ? 'text-green-400' : 'text-zinc-600'}`} />
                    <span className="text-zinc-300">API Providers Configured</span>
                  </div>
                  <Badge className={(health?.providers?.active || 0) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-zinc-600'}>
                    {(health?.providers?.active || 0) > 0 ? 'Active' : 'None'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${parseFloat(successRate) >= 95 ? 'text-green-400' : 'text-yellow-400'}`} />
                    <span className="text-zinc-300">API Success Rate</span>
                  </div>
                  <Badge className={parseFloat(successRate) >= 95 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                    {successRate}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${(health?.alertCount || 0) === 0 ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="text-zinc-300">Active Alerts</span>
                  </div>
                  <Badge className={(health?.alertCount || 0) === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {health?.alertCount || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-orange-400">Test {testDialogProvider} API Key</DialogTitle>
            <DialogDescription>
              Enter your API key to test the connection. The key is sent directly for validation and not stored.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-api-key">API Key</Label>
              <Input
                id="test-api-key"
                type="password"
                placeholder="Enter your API key..."
                value={testApiKey}
                onChange={(e) => setTestApiKey(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                data-testid="test-api-key-input"
              />
            </div>
            {testResult && (
              <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={testResult.success ? 'text-green-400' : 'text-red-400'}>
                    {testResult.message}
                  </span>
                </div>
                {testResult.latency && (
                  <p className="text-xs text-zinc-500 mt-1">Response time: {testResult.latency}ms</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setTestDialogOpen(false)}
              className="border-zinc-700"
              data-testid="cancel-test-button"
            >
              Cancel
            </Button>
            <Button 
              onClick={runTest}
              disabled={!testApiKey.trim() || testKeyMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
              data-testid="run-test-button"
            >
              {testKeyMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Run Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiDashboard;
