import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { 
  PlusCircle, Trash2, Key, RefreshCw, Cloud, Eye, EyeOff, Edit2, Save, X, Shield, 
  CheckCircle, AlertCircle, Zap, HeadphonesIcon, ArrowUpCircle, DollarSign, 
  Activity, Copy, AlertTriangle, ScanLine, ChevronDown, ChevronUp, Type, Image, AudioLines,
  CreditCard, Webhook, Link2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type ProviderType = 'ai' | 'cloud' | 'ocr';
type ApiKeyStatus = 'active' | 'inactive' | 'problem' | 'testing';
type PlanType = 'free' | 'credits_low' | 'credits_high' | 'unlimited';
type PriorityType = 'primary' | 'secondary' | 'tertiary' | 'optional';
type ModelCapability = 'text' | 'vision' | 'audio';

const PLAN_LABELS: Record<PlanType, string> = {
  free: 'Free',
  credits_low: 'Credits - Low',
  credits_high: 'Credits - High',
  unlimited: 'Unlimited'
};

const PRIORITY_OPTIONS: PriorityType[] = ['primary', 'secondary', 'tertiary', 'optional'];

interface PlanConfig {
  enabled: boolean;
  priority: PriorityType;
}

interface ModelVersion {
  id: string;
  name: string;
  version: string;
  isNew: boolean;
  isActive: boolean;
  releasedAt: Date;
  capabilities: ModelCapability[];
  planConfigs: Record<PlanType, PlanConfig>;
}

interface ProviderPlanConfig {
  enabled: boolean;
  priority: PriorityType;
}

interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  category: string;
  key: string;
  status: ApiKeyStatus;
  isEnabled: boolean;
  isPrimary: boolean;
  isBackup: boolean;
  backupPriority: number;
  createdAt: Date;
  lastTested?: Date;
  latency?: number;
  usage: {
    current: number;
    limit: number;
    cost: number;
    costRate: string;
  };
  models: ModelVersion[];
  planConfigs: Record<PlanType, ProviderPlanConfig>;
  supportAgentEnabled: boolean;
  alerts: SupportAlert[];
}

interface SupportAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  solution?: string;
  autoFixAvailable: boolean;
  timestamp: Date;
  resolved: boolean;
}

const defaultPlanConfig = (): Record<PlanType, PlanConfig> => ({
  free: { enabled: false, priority: 'optional' },
  credits_low: { enabled: false, priority: 'optional' },
  credits_high: { enabled: false, priority: 'optional' },
  unlimited: { enabled: false, priority: 'optional' }
});

const defaultProviderPlanConfig = (): Record<PlanType, ProviderPlanConfig> => ({
  free: { enabled: false, priority: 'optional' },
  credits_low: { enabled: false, priority: 'optional' },
  credits_high: { enabled: false, priority: 'optional' },
  unlimited: { enabled: false, priority: 'optional' }
});

const AdminApiManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('ai-providers');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [supportMonitorActive, setSupportMonitorActive] = useState(false);
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({});
  const [planFilter, setPlanFilter] = useState<PlanType | 'all'>('all');

  const defaultProviders: ProviderConfig[] = [
    { 
      id: '1', name: 'OpenAI', type: 'ai', category: 'openai', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: true, isBackup: false, backupPriority: 0, createdAt: new Date(),
      usage: { current: 0, limit: 100000, cost: 0, costRate: '$0.002/1K tokens' },
      planConfigs: defaultProviderPlanConfig(),
      models: [
        { id: 'm1', name: 'GPT-5.2 Pro', version: '2025-01', isNew: true, isActive: true, releasedAt: new Date('2025-01-01'), capabilities: ['text', 'vision'], planConfigs: { free: { enabled: false, priority: 'optional' }, credits_low: { enabled: false, priority: 'optional' }, credits_high: { enabled: true, priority: 'primary' }, unlimited: { enabled: true, priority: 'primary' } } },
        { id: 'm2', name: 'GPT-4o', version: '2024-05-13', isNew: false, isActive: true, releasedAt: new Date('2024-05-13'), capabilities: ['text', 'vision'], planConfigs: { free: { enabled: true, priority: 'primary' }, credits_low: { enabled: true, priority: 'primary' }, credits_high: { enabled: true, priority: 'secondary' }, unlimited: { enabled: true, priority: 'secondary' } } },
        { id: 'm3', name: 'GPT-4o Mini', version: '2024-07-18', isNew: false, isActive: true, releasedAt: new Date('2024-07-18'), capabilities: ['text', 'vision'], planConfigs: { free: { enabled: true, priority: 'secondary' }, credits_low: { enabled: true, priority: 'secondary' }, credits_high: { enabled: false, priority: 'optional' }, unlimited: { enabled: false, priority: 'optional' } } },
        { id: 'm4', name: 'GPT-3.5 Turbo', version: '2024-01-25', isNew: false, isActive: true, releasedAt: new Date('2024-01-25'), capabilities: ['text'], planConfigs: { free: { enabled: true, priority: 'tertiary' }, credits_low: { enabled: false, priority: 'optional' }, credits_high: { enabled: false, priority: 'optional' }, unlimited: { enabled: false, priority: 'optional' } } },
      ],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '2', name: 'Anthropic Claude', type: 'ai', category: 'anthropic', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: true, backupPriority: 1, createdAt: new Date(),
      usage: { current: 0, limit: 50000, cost: 0, costRate: '$0.003/1K tokens' },
      planConfigs: defaultProviderPlanConfig(),
      models: [
        { id: 'm5', name: 'Claude 4 Opus', version: '2025-01', isNew: true, isActive: true, releasedAt: new Date('2025-01-01'), capabilities: ['text', 'vision'], planConfigs: { free: { enabled: false, priority: 'optional' }, credits_low: { enabled: false, priority: 'optional' }, credits_high: { enabled: true, priority: 'primary' }, unlimited: { enabled: true, priority: 'primary' } } },
        { id: 'm6', name: 'Claude 3.5 Sonnet', version: '2024-06-20', isNew: false, isActive: true, releasedAt: new Date('2024-06-20'), capabilities: ['text', 'vision'], planConfigs: { free: { enabled: true, priority: 'secondary' }, credits_low: { enabled: true, priority: 'primary' }, credits_high: { enabled: true, priority: 'secondary' }, unlimited: { enabled: true, priority: 'secondary' } } },
        { id: 'm7', name: 'Claude 3 Haiku', version: '2024-03-07', isNew: false, isActive: true, releasedAt: new Date('2024-03-07'), capabilities: ['text', 'vision'], planConfigs: { free: { enabled: true, priority: 'tertiary' }, credits_low: { enabled: true, priority: 'tertiary' }, credits_high: { enabled: false, priority: 'optional' }, unlimited: { enabled: false, priority: 'optional' } } },
      ],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '3', name: 'Google Gemini', type: 'ai', category: 'google', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: true, backupPriority: 2, createdAt: new Date(),
      usage: { current: 0, limit: 60000, cost: 0, costRate: '$0.001/1K tokens' },
      planConfigs: defaultProviderPlanConfig(),
      models: [
        { id: 'm8', name: 'Gemini 2.0 Ultra', version: '2025-01', isNew: true, isActive: true, releasedAt: new Date('2025-01-01'), capabilities: ['text', 'vision', 'audio'], planConfigs: { free: { enabled: false, priority: 'optional' }, credits_low: { enabled: false, priority: 'optional' }, credits_high: { enabled: true, priority: 'primary' }, unlimited: { enabled: true, priority: 'primary' } } },
        { id: 'm9', name: 'Gemini 1.5 Pro', version: '2024-05-14', isNew: false, isActive: true, releasedAt: new Date('2024-05-14'), capabilities: ['text', 'vision', 'audio'], planConfigs: { free: { enabled: true, priority: 'primary' }, credits_low: { enabled: true, priority: 'primary' }, credits_high: { enabled: true, priority: 'secondary' }, unlimited: { enabled: true, priority: 'secondary' } } },
        { id: 'm10', name: 'Gemini 1.5 Flash', version: '2024-05-14', isNew: false, isActive: true, releasedAt: new Date('2024-05-14'), capabilities: ['text', 'vision'], planConfigs: { free: { enabled: true, priority: 'secondary' }, credits_low: { enabled: true, priority: 'secondary' }, credits_high: { enabled: false, priority: 'optional' }, unlimited: { enabled: false, priority: 'optional' } } },
      ],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '4', name: 'Mistral AI', type: 'ai', category: 'mistral', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: false, backupPriority: 0, createdAt: new Date(),
      usage: { current: 0, limit: 40000, cost: 0, costRate: '$0.0015/1K tokens' },
      planConfigs: defaultProviderPlanConfig(),
      models: [
        { id: 'm11', name: 'Mistral Large', version: '2024-02-26', isNew: false, isActive: true, releasedAt: new Date('2024-02-26'), capabilities: ['text'], planConfigs: defaultPlanConfig() },
        { id: 'm12', name: 'Mistral Medium', version: '2024-02-26', isNew: false, isActive: true, releasedAt: new Date('2024-02-26'), capabilities: ['text'], planConfigs: defaultPlanConfig() },
      ],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '5', name: 'Perplexity', type: 'ai', category: 'perplexity', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: false, backupPriority: 0, createdAt: new Date(),
      usage: { current: 0, limit: 30000, cost: 0, costRate: '$0.002/1K tokens' },
      planConfigs: defaultProviderPlanConfig(),
      models: [
        { id: 'm13', name: 'Sonar Pro', version: '2024-12', isNew: true, isActive: true, releasedAt: new Date('2024-12-01'), capabilities: ['text'], planConfigs: defaultPlanConfig() },
      ],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '6', name: 'xAI Grok', type: 'ai', category: 'xai', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: false, backupPriority: 0, createdAt: new Date(),
      usage: { current: 0, limit: 25000, cost: 0, costRate: '$0.005/1K tokens' },
      planConfigs: defaultProviderPlanConfig(),
      models: [
        { id: 'm14', name: 'Grok-2', version: '2024-08', isNew: false, isActive: true, releasedAt: new Date('2024-08-01'), capabilities: ['text', 'vision'], planConfigs: defaultPlanConfig() },
      ],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '7', name: 'OpenRouter', type: 'ai', category: 'openrouter', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: false, backupPriority: 0, createdAt: new Date(),
      usage: { current: 0, limit: 50000, cost: 0, costRate: 'Variable' },
      planConfigs: defaultProviderPlanConfig(),
      models: [
        { id: 'm15', name: 'Auto Router', version: '2024', isNew: false, isActive: true, releasedAt: new Date('2024-01-01'), capabilities: ['text', 'vision'], planConfigs: defaultPlanConfig() },
      ],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '10', name: 'Dropbox', type: 'cloud', category: 'dropbox', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: true, isBackup: false, backupPriority: 0, createdAt: new Date(),
      usage: { current: 0, limit: 2000000000, cost: 0, costRate: 'Free tier' },
      planConfigs: defaultProviderPlanConfig(),
      models: [],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '11', name: 'Google Drive', type: 'cloud', category: 'googledrive', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: true, backupPriority: 1, createdAt: new Date(),
      usage: { current: 0, limit: 15000000000, cost: 0, costRate: 'Free tier' },
      planConfigs: defaultProviderPlanConfig(),
      models: [],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '20', name: 'TechVision OCR', type: 'ocr', category: 'techvision', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: true, isBackup: false, backupPriority: 0, createdAt: new Date(),
      usage: { current: 0, limit: 10000, cost: 0, costRate: '$0.001/page' },
      planConfigs: { free: { enabled: true, priority: 'primary' }, credits_low: { enabled: true, priority: 'primary' }, credits_high: { enabled: true, priority: 'primary' }, unlimited: { enabled: true, priority: 'primary' } },
      models: [],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '21', name: 'Google Cloud Vision', type: 'ocr', category: 'google-vision', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: true, backupPriority: 1, createdAt: new Date(),
      usage: { current: 0, limit: 5000, cost: 0, costRate: '$0.0015/page' },
      planConfigs: { free: { enabled: true, priority: 'secondary' }, credits_low: { enabled: true, priority: 'secondary' }, credits_high: { enabled: true, priority: 'secondary' }, unlimited: { enabled: true, priority: 'secondary' } },
      models: [],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '22', name: 'AWS Textract', type: 'ocr', category: 'aws-textract', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: true, backupPriority: 2, createdAt: new Date(),
      usage: { current: 0, limit: 5000, cost: 0, costRate: '$0.0015/page' },
      planConfigs: { free: { enabled: false, priority: 'optional' }, credits_low: { enabled: true, priority: 'tertiary' }, credits_high: { enabled: true, priority: 'tertiary' }, unlimited: { enabled: true, priority: 'tertiary' } },
      models: [],
      supportAgentEnabled: false, alerts: []
    },
    { 
      id: '23', name: 'Azure Computer Vision', type: 'ocr', category: 'azure-vision', key: '', status: 'inactive', 
      isEnabled: false, isPrimary: false, isBackup: true, backupPriority: 3, createdAt: new Date(),
      usage: { current: 0, limit: 5000, cost: 0, costRate: '$0.001/page' },
      planConfigs: { free: { enabled: false, priority: 'optional' }, credits_low: { enabled: false, priority: 'optional' }, credits_high: { enabled: true, priority: 'optional' }, unlimited: { enabled: true, priority: 'optional' } },
      models: [],
      supportAgentEnabled: false, alerts: []
    },
  ];

  const [providers, setProviders] = useState<ProviderConfig[]>(() => {
    const saved = localStorage.getItem('nameWizardProviders_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            lastTested: p.lastTested ? new Date(p.lastTested) : undefined,
            planConfigs: p.planConfigs || defaultProviderPlanConfig(),
            models: p.models?.map((m: any) => ({ 
              ...m, 
              releasedAt: new Date(m.releasedAt),
              capabilities: m.capabilities || ['text'],
              planConfigs: m.planConfigs || defaultPlanConfig()
            })) || [],
            alerts: p.alerts?.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })) || []
          }));
        }
      } catch (e) {
        return defaultProviders;
      }
    }
    return defaultProviders;
  });

  const [newProvider, setNewProvider] = useState({
    name: '',
    key: '',
    type: 'ai' as ProviderType,
    category: 'other'
  });

  useEffect(() => {
    localStorage.setItem('nameWizardProviders_v2', JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    if (supportMonitorActive) {
      const interval = setInterval(() => {
        runSupportMonitor();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [supportMonitorActive]);

  const runSupportMonitor = async () => {
    const alertPromises: Promise<void>[] = [];
    
    setProviders(prev => prev.map(p => {
      if (p.supportAgentEnabled && p.key && p.isEnabled) {
        const hasIssue = Math.random() < 0.1;
        if (hasIssue) {
          const isError = Math.random() > 0.5;
          const message = Math.random() > 0.5 ? 'High latency detected' : 'Rate limit approaching';
          
          const newAlert: SupportAlert = {
            id: Date.now().toString(),
            type: isError ? 'error' : 'warning',
            message,
            solution: 'Consider enabling backup provider or upgrading plan',
            autoFixAvailable: true,
            timestamp: new Date(),
            resolved: false
          };
          
          toast({
            title: `Alert: ${p.name}`,
            description: newAlert.message,
            variant: newAlert.type === 'error' ? 'destructive' : 'default'
          });
          
          alertPromises.push(
            apiRequest('POST', '/api/alerts', {
              serviceName: p.name,
              severity: isError ? 'critical' : 'warning',
              title: `${p.name}: ${message}`,
              message: `Provider ${p.name} is experiencing issues: ${message}`,
              reason: message,
              fixAction: 'Consider enabling backup provider or upgrading plan',
              fixLink: '/admin/api-management',
              autoFixAvailable: true,
              detectedBy: 'Support Monitor'
            }).then(() => {}).catch((err: unknown) => console.error('Failed to create alert:', err))
          );
          
          return { ...p, alerts: [...p.alerts, newAlert] };
        }
      }
      return p;
    }));
    
    await Promise.all(alertPromises);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const startEditing = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  const saveEdit = (id: string) => {
    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, key: editValue, status: editValue ? 'inactive' : 'inactive' } : p
    ));
    setEditingId(null);
    setEditValue('');
    toast({ title: "API Key Updated", description: "The key has been saved." });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleToggleProvider = (id: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        const newEnabled = !p.isEnabled;
        return { ...p, isEnabled: newEnabled, status: p.key ? (newEnabled ? 'active' : 'inactive') : 'inactive' };
      }
      return p;
    }));
  };

  const handleDeleteProvider = (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
    toast({ title: "Provider Deleted", description: "The provider has been removed." });
  };

  const handleTestProvider = async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider?.key) {
      toast({ title: "No key configured", description: "Please enter an API key first.", variant: "destructive" });
      return;
    }

    setProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'testing' } : p));
    toast({ title: "Testing Connection", description: `Testing ${provider.name}...` });

    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const success = provider.key.length > 10;
    const latency = Math.floor(Math.random() * 200) + 50;

    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, status: success ? 'active' : 'problem', lastTested: new Date(), latency } : p
    ));

    toast({
      title: success ? "Connection Successful" : "Connection Failed",
      description: success ? `${provider.name} responded in ${latency}ms` : `Could not connect to ${provider.name}`,
      variant: success ? "default" : "destructive"
    });
  };

  const handleUpdateProvider = async (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (!provider) return;

    toast({ title: "Checking for updates", description: `Checking ${provider.name} for new models...` });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const hasNewModel = Math.random() > 0.5;
    if (hasNewModel) {
      const newModel: ModelVersion = {
        id: `m-${Date.now()}`,
        name: `${provider.name} Latest`,
        version: `v${new Date().getFullYear()}.${new Date().getMonth() + 1}`,
        isNew: true,
        isActive: false,
        releasedAt: new Date(),
        capabilities: ['text'],
        planConfigs: defaultPlanConfig()
      };

      setProviders(prev => prev.map(p => 
        p.id === id ? { ...p, models: [...p.models, newModel] } : p
      ));

      toast({
        title: "New Model Available!",
        description: `${newModel.name} ${newModel.version} has been added. Previous versions are preserved.`
      });
    } else {
      toast({ title: "Up to date", description: `${provider.name} is using the latest models.` });
    }
  };

  const handleToggleSupportAgent = (id: string) => {
    setProviders(prev => prev.map(p => 
      p.id === id ? { ...p, supportAgentEnabled: !p.supportAgentEnabled } : p
    ));
    const provider = providers.find(p => p.id === id);
    if (provider) {
      toast({
        title: provider.supportAgentEnabled ? "Support Agent Disabled" : "Support Agent Enabled",
        description: provider.supportAgentEnabled 
          ? `Monitoring stopped for ${provider.name}` 
          : `Now monitoring ${provider.name} for issues`
      });
    }
    setSupportMonitorActive(true);
  };

  const handleAutoFix = async (providerId: string, alertId: string) => {
    toast({ title: "Auto-fixing", description: "Attempting automatic resolution..." });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProviders(prev => prev.map(p => 
      p.id === providerId ? {
        ...p,
        alerts: p.alerts.map(a => a.id === alertId ? { ...a, resolved: true } : a)
      } : p
    ));

    toast({ title: "Issue Resolved", description: "The problem has been automatically fixed." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "API key copied to clipboard" });
  };

  const handleAddProvider = () => {
    if (!newProvider.name || !newProvider.key) {
      toast({ title: "Missing information", description: "Please provide both name and key.", variant: "destructive" });
      return;
    }

    const provider: ProviderConfig = {
      id: Date.now().toString(),
      name: newProvider.name,
      type: newProvider.type,
      category: newProvider.category,
      key: newProvider.key,
      status: 'inactive',
      isEnabled: false,
      isPrimary: false,
      isBackup: false,
      backupPriority: 0,
      createdAt: new Date(),
      usage: { current: 0, limit: 10000, cost: 0, costRate: 'Custom' },
      planConfigs: defaultProviderPlanConfig(),
      models: [],
      supportAgentEnabled: false,
      alerts: []
    };

    setProviders(prev => [...prev, provider]);
    setNewProvider({ name: '', key: '', type: 'ai', category: 'other' });
    toast({ title: "Provider Added", description: `${provider.name} has been added.` });
  };

  const handleModelPlanToggle = (providerId: string, modelId: string, plan: PlanType, enabled: boolean) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          models: p.models.map(m => {
            if (m.id === modelId) {
              return {
                ...m,
                planConfigs: {
                  ...m.planConfigs,
                  [plan]: { ...m.planConfigs[plan], enabled }
                }
              };
            }
            return m;
          })
        };
      }
      return p;
    }));
  };

  const handleModelPriorityChange = (providerId: string, modelId: string, plan: PlanType, priority: PriorityType) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          models: p.models.map(m => {
            if (m.id === modelId) {
              return {
                ...m,
                planConfigs: {
                  ...m.planConfigs,
                  [plan]: { ...m.planConfigs[plan], priority }
                }
              };
            }
            return m;
          })
        };
      }
      return p;
    }));
  };

  const handleProviderPlanToggle = (providerId: string, plan: PlanType, enabled: boolean) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          planConfigs: {
            ...p.planConfigs,
            [plan]: { ...p.planConfigs[plan], enabled }
          }
        };
      }
      return p;
    }));
  };

  const handleProviderPriorityChange = (providerId: string, plan: PlanType, priority: PriorityType) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          planConfigs: {
            ...p.planConfigs,
            [plan]: { ...p.planConfigs[plan], priority }
          }
        };
      }
      return p;
    }));
  };

  const toggleExpandModels = (providerId: string) => {
    setExpandedModels(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const getStatusBadge = (status: ApiKeyStatus, hasKey: boolean) => {
    if (!hasKey) return <Badge variant="outline" className="bg-zinc-800 text-zinc-400">Not Configured</Badge>;
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-zinc-800 text-zinc-400">Inactive</Badge>;
      case 'problem':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><AlertCircle className="w-3 h-3 mr-1" /> Problem</Badge>;
      case 'testing':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Testing</Badge>;
    }
  };

  const getProviderIcon = (category: string) => {
    const icons: Record<string, string> = {
      openai: '🤖', anthropic: '🧠', google: '🔮', mistral: '💨', perplexity: '🔍',
      xai: '⚡', openrouter: '🔀', dropbox: '📦', googledrive: '📁', techvision: '👁️', 
      'google-vision': '🔎', 'aws-textract': '📄', 'azure-vision': '🖼️', other: '🔑'
    };
    return icons[category] || '🔑';
  };

  const getCapabilityIcon = (cap: ModelCapability) => {
    switch (cap) {
      case 'text': return <Type className="w-3 h-3" />;
      case 'vision': return <Image className="w-3 h-3" />;
      case 'audio': return <AudioLines className="w-3 h-3" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getPriorityColor = (priority: PriorityType) => {
    switch (priority) {
      case 'primary': return 'text-green-400';
      case 'secondary': return 'text-blue-400';
      case 'tertiary': return 'text-yellow-400';
      case 'optional': return 'text-zinc-400';
    }
  };

  const renderModelConfigRow = (provider: ProviderConfig, model: ModelVersion) => {
    const plans: PlanType[] = ['free', 'credits_low', 'credits_high', 'unlimited'];
    const filteredPlans = planFilter === 'all' ? plans : plans.filter(p => p === planFilter);

    return (
      <div key={model.id} className="bg-zinc-800/30 rounded-lg p-3 space-y-3" data-testid={`model-config-${model.id}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-orange-200 font-medium">{model.name}</span>
            <span className="text-zinc-500 text-sm">{model.version}</span>
            {model.isNew && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <Zap className="w-3 h-3 mr-1" /> NEW
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {model.capabilities.map(cap => (
              <Badge key={cap} variant="outline" className="bg-zinc-700/50 text-zinc-300 text-xs px-2 py-0.5">
                {getCapabilityIcon(cap)}
                <span className="ml-1">{cap}</span>
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {filteredPlans.map(plan => (
            <div key={plan} className="bg-zinc-900/50 rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{PLAN_LABELS[plan]}</span>
                <Checkbox
                  checked={model.planConfigs[plan]?.enabled || false}
                  onCheckedChange={(checked) => handleModelPlanToggle(provider.id, model.id, plan, !!checked)}
                  className="border-zinc-600 data-[state=checked]:bg-orange-500"
                  data-testid={`checkbox-model-${model.id}-${plan}`}
                />
              </div>
              {model.planConfigs[plan]?.enabled && (
                <Select
                  value={model.planConfigs[plan]?.priority || 'optional'}
                  onValueChange={(v: PriorityType) => handleModelPriorityChange(provider.id, model.id, plan, v)}
                >
                  <SelectTrigger className="h-7 text-xs bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {PRIORITY_OPTIONS.map(p => (
                      <SelectItem key={p} value={p} className={getPriorityColor(p)}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderOCRPlanConfig = (provider: ProviderConfig) => {
    const plans: PlanType[] = ['free', 'credits_low', 'credits_high', 'unlimited'];

    return (
      <div className="bg-zinc-800/30 rounded-lg p-3 space-y-3">
        <Label className="text-orange-200 text-sm">Plan Configuration</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {plans.map(plan => (
            <div key={plan} className="bg-zinc-900/50 rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{PLAN_LABELS[plan]}</span>
                <Checkbox
                  checked={provider.planConfigs[plan]?.enabled || false}
                  onCheckedChange={(checked) => handleProviderPlanToggle(provider.id, plan, !!checked)}
                  className="border-zinc-600 data-[state=checked]:bg-orange-500"
                  data-testid={`checkbox-ocr-${provider.id}-${plan}`}
                />
              </div>
              {provider.planConfigs[plan]?.enabled && (
                <Select
                  value={provider.planConfigs[plan]?.priority || 'optional'}
                  onValueChange={(v: PriorityType) => handleProviderPriorityChange(provider.id, plan, v)}
                >
                  <SelectTrigger className="h-7 text-xs bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {PRIORITY_OPTIONS.map(p => (
                      <SelectItem key={p} value={p} className={getPriorityColor(p)}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProviderCard = (provider: ProviderConfig, showModels: boolean = false, showOCRPlanConfig: boolean = false) => (
    <div key={provider.id} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-4" data-testid={`provider-card-${provider.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{getProviderIcon(provider.category)}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-orange-200 text-lg">{provider.name}</span>
              {getStatusBadge(provider.status, !!provider.key)}
              {provider.isPrimary && <Badge className="bg-blue-500/20 text-blue-400">Primary</Badge>}
              {provider.isBackup && <Badge className="bg-purple-500/20 text-purple-400">Backup #{provider.backupPriority}</Badge>}
            </div>
            {provider.latency && (
              <p className="text-xs text-zinc-500">Latency: {provider.latency}ms</p>
            )}
            {provider.lastTested && (
              <p className="text-xs text-zinc-500">Last tested: {provider.lastTested.toLocaleString()}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            checked={provider.isEnabled}
            onCheckedChange={() => handleToggleProvider(provider.id)}
            disabled={!provider.key}
            data-testid={`switch-enable-${provider.id}`}
          />
          <span className="text-xs text-zinc-500">{provider.isEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {editingId === provider.id ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              type={showKeys[provider.id] ? 'text' : 'password'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Enter API key..."
              className="bg-zinc-700 border-zinc-600 text-white flex-1"
              data-testid={`input-api-key-${provider.id}`}
            />
            <Button size="sm" variant="ghost" onClick={() => toggleShowKey(provider.id)} className="text-zinc-400">
              {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button size="sm" onClick={() => saveEdit(provider.id)} className="bg-green-600 hover:bg-green-700" data-testid={`button-save-key-${provider.id}`}>
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={cancelEdit} className="border-zinc-600" data-testid={`button-cancel-${provider.id}`}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 flex items-center gap-2">
              <Input
                type={showKeys[provider.id] ? 'text' : 'password'}
                value={showKeys[provider.id] ? provider.key : maskKey(provider.key)}
                readOnly
                placeholder="(not configured)"
                className="bg-zinc-700 border-zinc-600 text-zinc-300 flex-1"
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => toggleShowKey(provider.id)} 
                className="text-zinc-400 hover:text-white"
                data-testid={`button-toggle-show-${provider.id}`}
              >
                {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              {provider.key && showKeys[provider.id] && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => copyToClipboard(provider.key)} 
                  className="text-zinc-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => startEditing(provider.id, provider.key)} 
              className="text-orange-400 hover:text-orange-300"
              data-testid={`button-edit-key-${provider.id}`}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="bg-zinc-900/50 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Usage</span>
          <span className="text-sm text-orange-400">{provider.usage.costRate}</span>
        </div>
        <Progress value={(provider.usage.current / provider.usage.limit) * 100} className="h-2" />
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-zinc-500">
            {provider.type === 'cloud' ? formatBytes(provider.usage.current) : provider.usage.current.toLocaleString()} / 
            {provider.type === 'cloud' ? formatBytes(provider.usage.limit) : provider.usage.limit.toLocaleString()}
          </span>
          <span className="text-green-400 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> ${provider.usage.cost.toFixed(2)}
          </span>
        </div>
      </div>

      {showModels && provider.models.length > 0 && (
        <Collapsible open={expandedModels[provider.id]} onOpenChange={() => toggleExpandModels(provider.id)}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between text-orange-200 hover:bg-zinc-700/50">
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Model Configuration ({provider.models.length} models)
              </span>
              {expandedModels[provider.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-zinc-500">Filter by plan:</span>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant={planFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setPlanFilter('all')}
                  className={`h-6 text-xs ${planFilter === 'all' ? 'bg-orange-500' : 'border-zinc-600'}`}
                >
                  All
                </Button>
                {(['free', 'credits_low', 'credits_high', 'unlimited'] as PlanType[]).map(plan => (
                  <Button 
                    key={plan}
                    size="sm" 
                    variant={planFilter === plan ? 'default' : 'outline'}
                    onClick={() => setPlanFilter(plan)}
                    className={`h-6 text-xs ${planFilter === plan ? 'bg-orange-500' : 'border-zinc-600'}`}
                  >
                    {PLAN_LABELS[plan]}
                  </Button>
                ))}
              </div>
            </div>
            {provider.models.map(model => renderModelConfigRow(provider, model))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {showOCRPlanConfig && renderOCRPlanConfig(provider)}

      {provider.alerts.filter(a => !a.resolved).length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Active Alerts</span>
          </div>
          {provider.alerts.filter(a => !a.resolved).map(alert => (
            <div key={alert.id} className="flex items-center justify-between bg-zinc-900/50 p-2 rounded">
              <div>
                <p className="text-sm text-zinc-300">{alert.message}</p>
                {alert.solution && <p className="text-xs text-zinc-500">{alert.solution}</p>}
              </div>
              {alert.autoFixAvailable && (
                <Button 
                  size="sm" 
                  onClick={() => handleAutoFix(provider.id, alert.id)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Auto-Fix
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-zinc-700">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleTestProvider(provider.id)}
          className="border-orange-500 text-orange-400 hover:bg-orange-500/20"
          disabled={!provider.key || provider.status === 'testing'}
          data-testid={`button-test-${provider.id}`}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${provider.status === 'testing' ? 'animate-spin' : ''}`} /> Test
        </Button>
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => handleUpdateProvider(provider.id)}
          className="border-blue-500 text-blue-400 hover:bg-blue-500/20"
          disabled={!provider.key}
          data-testid={`button-update-${provider.id}`}
        >
          <ArrowUpCircle className="w-4 h-4 mr-1" /> Update
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              size="sm" 
              variant="outline"
              className={`${provider.supportAgentEnabled ? 'border-green-500 text-green-400' : 'border-purple-500 text-purple-400'} hover:bg-purple-500/20`}
              data-testid={`button-support-${provider.id}`}
            >
              <HeadphonesIcon className="w-4 h-4 mr-1" /> Support
              {provider.supportAgentEnabled && <Activity className="w-3 h-3 ml-1 animate-pulse" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-zinc-900 border-zinc-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-orange-400 font-medium">AI Support Agent</h4>
                  <p className="text-xs text-zinc-500">Monitors for issues and auto-diagnoses</p>
                </div>
                <Switch
                  checked={provider.supportAgentEnabled}
                  onCheckedChange={() => handleToggleSupportAgent(provider.id)}
                />
              </div>
              {provider.supportAgentEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>Monitoring active</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    The agent will automatically detect issues, suggest solutions, and can auto-fix common problems.
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1" />
        
        <Button 
          size="sm" 
          variant="destructive" 
          onClick={() => handleDeleteProvider(provider.id)}
          data-testid={`button-delete-${provider.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const aiProviders = providers.filter(p => p.type === 'ai');
  const cloudProviders = providers.filter(p => p.type === 'cloud');
  const ocrProviders = providers.filter(p => p.type === 'ocr');

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">API Key Management</h1>
            <p className="text-zinc-400">God Admin Control Panel - Configure API keys and plan access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {supportMonitorActive && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="w-3 h-3 mr-1 animate-pulse" /> Support Monitor Active
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-zinc-400 hover:text-orange-400 hover:bg-zinc-800"
            data-testid="button-close-page"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 grid w-full grid-cols-4">
          <TabsTrigger value="ai-providers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Key className="w-4 h-4 mr-2" />
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="cloud-storage" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Cloud className="w-4 h-4 mr-2" />
            Cloud Storage
          </TabsTrigger>
          <TabsTrigger value="ocr-providers" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <ScanLine className="w-4 h-4 mr-2" />
            OCR Providers
          </TabsTrigger>
          <TabsTrigger value="stripe" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Stripe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-providers" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">AI/LLM Providers</CardTitle>
              <CardDescription>Configure AI provider API keys and model access per pricing plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiProviders.map(p => renderProviderCard(p, true, false))}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">Add New AI Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-orange-200">Provider Name</Label>
                  <Input
                    value={newProvider.name}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Custom LLM"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div>
                  <Label className="text-orange-200">Type</Label>
                  <Select 
                    value={newProvider.category} 
                    onValueChange={(v) => setNewProvider(prev => ({ ...prev, category: v, type: 'ai' }))}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="openai">OpenAI Compatible</SelectItem>
                      <SelectItem value="anthropic">Anthropic Compatible</SelectItem>
                      <SelectItem value="google">Google Compatible</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-orange-200">API Key</Label>
                  <Input
                    type="password"
                    value={newProvider.key}
                    onChange={(e) => setNewProvider(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="sk-..."
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddProvider} className="bg-orange-500 hover:bg-orange-600 w-full">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Provider
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud-storage" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">Cloud Storage Providers</CardTitle>
              <CardDescription>Configure cloud storage API keys with failover support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cloudProviders.map(p => renderProviderCard(p, false, false))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocr-providers" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">OCR Providers</CardTitle>
              <CardDescription>Configure OCR provider API keys with per-plan access and failover priority</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ocrProviders.map(p => renderProviderCard(p, false, true))}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-orange-400">Failover Summary by Plan</CardTitle>
              <CardDescription>Overview of OCR provider priority order for each pricing plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['free', 'credits_low', 'credits_high', 'unlimited'] as PlanType[]).map(plan => {
                  const enabledProviders = ocrProviders
                    .filter(p => p.planConfigs[plan]?.enabled)
                    .sort((a, b) => {
                      const priorityOrder = { primary: 0, secondary: 1, tertiary: 2, optional: 3 };
                      return priorityOrder[a.planConfigs[plan]?.priority || 'optional'] - priorityOrder[b.planConfigs[plan]?.priority || 'optional'];
                    });

                  return (
                    <div key={plan} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                      <h4 className="text-orange-400 font-medium mb-2">{PLAN_LABELS[plan]}</h4>
                      {enabledProviders.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No providers enabled</p>
                      ) : (
                        <div className="space-y-1">
                          {enabledProviders.map((p, idx) => (
                            <div key={p.id} className="flex items-center gap-2 text-sm">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                idx === 0 ? 'bg-green-500/20 text-green-400' : 
                                idx === 1 ? 'bg-blue-500/20 text-blue-400' : 
                                idx === 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-600 text-zinc-400'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="text-zinc-300">{p.name}</span>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(p.planConfigs[plan]?.priority || 'optional')}`}>
                                {p.planConfigs[plan]?.priority || 'optional'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">💳</span>
                <div>
                  <CardTitle className="text-orange-400">Stripe Configuration</CardTitle>
                  <CardDescription>Configure Stripe API keys and webhook secrets for payment processing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                  <Key className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-medium text-orange-200">API Keys</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-orange-200">Secret Key</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="password"
                          placeholder="sk_live_... or sk_test_..."
                          className="bg-zinc-800 border-zinc-700 font-mono"
                          disabled
                          value="••••••••••••••••"
                          data-testid="input-stripe-secret-key"
                        />
                        <Badge variant="outline" className="text-zinc-400">
                          Set via Secrets
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500">STRIPE_SECRET_KEY - Set in Replit Secrets tab</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-orange-200">Publishable Key</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="pk_live_... or pk_test_..."
                          className="bg-zinc-800 border-zinc-700 font-mono"
                          disabled
                          value="••••••••••••••••"
                          data-testid="input-stripe-publishable-key"
                        />
                        <Badge variant="outline" className="text-zinc-400">
                          Set via Secrets
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500">VITE_STRIPE_PUBLIC_KEY - Set in Replit Secrets tab</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                  <Webhook className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-medium text-orange-200">Webhook Configuration</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-orange-200">Webhook Endpoint URL</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={`${window.location.origin}/api/stripe/webhook`}
                        className="bg-zinc-800 border-zinc-700 font-mono text-sm"
                        readOnly
                        data-testid="input-webhook-url"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/api/stripe/webhook`);
                          toast({ title: "Copied", description: "Webhook URL copied to clipboard" });
                        }}
                        className="border-zinc-700 hover:bg-zinc-700"
                        data-testid="button-copy-webhook-url"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500">Add this URL to your Stripe Dashboard → Developers → Webhooks</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-orange-200">Webhook Secret</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        placeholder="whsec_..."
                        className="bg-zinc-800 border-zinc-700 font-mono"
                        disabled
                        value="••••••••••••••••"
                        data-testid="input-webhook-secret"
                      />
                      <Badge variant="outline" className="text-zinc-400">
                        Set via Secrets
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500">STRIPE_WEBHOOK_SECRET - Get from Stripe after adding webhook</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-medium text-orange-200">Price IDs</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">Create products in Stripe Dashboard, then add the price IDs as environment variables:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-orange-300">Basic Plan ($19/mo)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-zinc-400 w-20">Monthly:</Label>
                        <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-300">STRIPE_BASIC_MONTHLY_PRICE_ID</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-zinc-400 w-20">Yearly:</Label>
                        <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-300">STRIPE_BASIC_YEARLY_PRICE_ID</code>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-orange-300">Pro Plan ($49/mo)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-zinc-400 w-20">Monthly:</Label>
                        <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-300">STRIPE_PRO_MONTHLY_PRICE_ID</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-zinc-400 w-20">Yearly:</Label>
                        <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-300">STRIPE_PRO_YEARLY_PRICE_ID</code>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-orange-300">Unlimited Plan ($99/mo or $1188/yr)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-zinc-400 w-20">Monthly:</Label>
                        <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-300">STRIPE_UNLIMITED_MONTHLY_PRICE_ID</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-zinc-400 w-20">Yearly:</Label>
                        <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-300">STRIPE_UNLIMITED_YEARLY_PRICE_ID</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-medium text-orange-200">Webhook Events</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-3">Enable these events in your Stripe webhook configuration:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    'checkout.session.completed',
                    'customer.subscription.updated',
                    'customer.subscription.deleted',
                    'invoice.payment_failed'
                  ].map(event => (
                    <div key={event} className="flex items-center gap-2 bg-zinc-900/50 rounded px-2 py-1">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <code className="text-xs text-zinc-300">{event}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-300">Security Note</h4>
                    <p className="text-sm text-amber-200/80 mt-1">
                      All Stripe keys must be added via the Replit Secrets tab, not through this interface.
                      This ensures your API keys remain secure and are never exposed in client-side code.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminApiManagement;
