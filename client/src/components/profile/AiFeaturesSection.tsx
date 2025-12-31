import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, Sparkles, Images, FileText, Group, FileCheck, 
  Server, Type, Globe, Copy, CheckCircle, Activity
} from 'lucide-react';

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  requiresApiKey: boolean;
  model: string;
  badge?: 'new' | 'beta' | 'premium';
  status: 'working' | 'not_working' | 'unknown';
  isLoading?: boolean;
}

const AiFeaturesSection: React.FC = () => {
  const { toast } = useToast();
  const [features, setFeatures] = useState<AIFeature[]>([
    {
      id: 'content-aware-naming',
      name: 'Content-Aware Naming',
      description: 'Uses AI to analyze file content (text, images, or metadata) and generate descriptive, context-rich filenames automatically.',
      icon: <Brain className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o',
      status: 'working',
      isLoading: false
    },
    {
      id: 'batch-processing',
      name: 'Batch Processing with Smart Grouping',
      description: 'Rename large sets of files at once, with AI grouping similar files and applying consistent naming conventions to each group.',
      icon: <Group className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o',
      status: 'working',
      isLoading: false
    },
    {
      id: 'naming-templates',
      name: 'Customizable Naming Templates',
      description: 'Define or select naming templates (e.g., {date}_{project}_{description}) that AI can fill in based on file analysis.',
      icon: <FileText className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: false,
      model: '',
      status: 'working',
      isLoading: false
    },
    {
      id: 'metadata-extraction',
      name: 'AI-Powered Metadata Extraction',
      description: 'Extract and use metadata (creation date, author, file type, keywords) to enhance filename relevance and searchability.',
      icon: <FileCheck className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o',
      status: 'working',
      isLoading: false
    },
    {
      id: 'content-detection',
      name: 'Image & Document Content Detection',
      description: 'For images, use vision models to identify objects/scenes; for documents, summarize or extract main topics for naming.',
      icon: <Images className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o',
      badge: 'premium',
      status: 'working',
      isLoading: false
    },
    {
      id: 'preview-approval',
      name: 'Preview & Approval Workflow',
      description: 'Show AI-generated name suggestions for user review and approval before applying changes, ensuring accuracy and user control.',
      icon: <FileCheck className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: false,
      model: '',
      status: 'working',
      isLoading: false
    },
    {
      id: 'local-ai',
      name: 'Local AI Model Support',
      description: 'Enable use of local AI models (e.g., Ollama, LM Studio) for privacy and offline processing.',
      icon: <Server className="w-5 h-5" />,
      enabled: false,
      requiresApiKey: false,
      model: 'ollama',
      badge: 'beta',
      status: 'unknown',
      isLoading: false
    },
    {
      id: 'case-format',
      name: 'Intelligent Case & Format Handling',
      description: 'Automatically adjust case (snake_case, PascalCase, kebab-case) and enforce length or character limits per user or project standards.',
      icon: <Type className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_3_5_turbo',
      status: 'working',
      isLoading: false
    },
    {
      id: 'multi-language',
      name: 'Multi-Format and Multi-Language Support',
      description: 'Handle a wide range of file types and support naming in multiple languages based on content detection.',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o',
      status: 'working',
      isLoading: false
    },
    {
      id: 'duplicate-resolution',
      name: 'Duplicate & Conflict Resolution',
      description: 'AI detects potential naming conflicts or duplicates and suggests unique, context-aware alternatives to prevent overwriting or confusion.',
      icon: <Copy className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o_mini',
      badge: 'new',
      status: 'working',
      isLoading: false
    }
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => 
        feature.id === id ? { ...feature, enabled: !feature.enabled } : feature
      )
    );

    const feature = features.find(f => f.id === id);
    
    toast({
      title: feature?.enabled ? `${feature?.name} disabled` : `${feature?.name} enabled`,
      description: feature?.enabled 
        ? `${feature?.name} has been disabled` 
        : `${feature?.name} has been enabled`,
      variant: "default",
    });
  };
  
  const testFeature = async (id: string) => {
    // Set loading state
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => 
        feature.id === id ? { ...feature, isLoading: true } : feature
      )
    );
    
    try {
      // Simulate API call to test feature
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Randomly determine success/failure for demo purposes (in real app, this would be actual API response)
      const success = Math.random() > 0.2;
      
      // Update feature status
      setFeatures(prevFeatures => 
        prevFeatures.map(feature => 
          feature.id === id ? { 
            ...feature, 
            isLoading: false, 
            status: success ? 'working' : 'not_working' 
          } : feature
        )
      );
      
      const feature = features.find(f => f.id === id);
      
      toast({
        title: success ? 'Test successful' : 'Test failed',
        description: success 
          ? `${feature?.name} is working correctly` 
          : `${feature?.name} test failed. Please check API key or try again.`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      // Handle errors
      setFeatures(prevFeatures => 
        prevFeatures.map(feature => 
          feature.id === id ? { ...feature, isLoading: false, status: 'not_working' } : feature
        )
      );
      
      toast({
        title: 'Test error',
        description: 'An error occurred while testing the feature',
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (badge?: 'new' | 'beta' | 'premium') => {
    switch (badge) {
      case 'new':
        return "bg-green-500 hover:bg-green-600";
      case 'beta':
        return "bg-blue-500 hover:bg-blue-600";
      case 'premium':
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "";
    }
  };

  const getModelDisplay = (model: string) => {
    if (!model) return null;
    
    const models: {[key: string]: string} = {
      'gpt_4o': 'GPT-4o',
      'gpt_4o_mini': 'GPT-4o mini',
      'gpt_4_turbo': 'GPT-4 Turbo',
      'gpt_3_5_turbo': 'GPT-3.5 Turbo',
      'claude_3_5_sonnet': 'Claude 3.5 Sonnet',
      'claude_3_opus': 'Claude 3 Opus',
      'llama_3_2_90b': 'Llama 3.2 90B',
      'llama_3_70b': 'Llama 3 70B',
      'gemini_1_5_pro': 'Gemini 1.5 Pro',
      'ollama': 'Ollama (Local)',
    };
    
    return models[model] || model;
  };

  // Function to determine status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-green-500';
      case 'not_working':
        return 'bg-red-500';
      case 'unknown':
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">AI Features</h2>
        <p className="text-gray-300 text-sm">Enable or disable AI-powered features for your file renaming experience</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {features.map((feature) => (
          <div key={feature.id} className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-950 flex items-center justify-center text-orange-500">
                  {feature.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{feature.name}</h3>
                    {feature.badge && (
                      <Badge className={getBadgeVariant(feature.badge)}>
                        {feature.badge.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{feature.description}</p>
                  
                  {feature.requiresApiKey && feature.enabled && (
                    <div className="mt-2 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs text-gray-300">Powered by {getModelDisplay(feature.model)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <Switch
                  checked={feature.enabled}
                  onCheckedChange={() => toggleFeature(feature.id)}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>
            </div>
            
            {/* Feature controls and status */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(feature.status)} animate-pulse`}></div>
                <span className="text-sm text-gray-300">
                  Status: {feature.status === 'working' ? 'Working' : feature.status === 'not_working' ? 'Not Working' : 'Unknown'}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-orange-500 text-orange-500 hover:bg-orange-950 hover:text-orange-400 focus:ring-orange-500"
                onClick={() => testFeature(feature.id)}
                disabled={feature.isLoading}
              >
                {feature.isLoading ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test Feature
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiFeaturesSection;