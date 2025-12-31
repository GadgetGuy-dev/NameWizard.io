import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { 
  Brain, 
  FileText, 
  Group, 
  FileImage, 
  Eye, 
  Server, 
  Text, 
  Globe, 
  Copy,
  Sparkles,
  Bot,
  Sliders,
  Cog,
  CheckCircle,
  X,
  XCircle,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  requiresApiKey?: boolean;
  model?: string;
  status?: 'working' | 'maintenance' | 'deprecating';
  badge?: 'new' | 'beta' | 'premium';
  isLoading?: boolean;
}

const AIFeaturesPage: React.FC = () => {
  const { toast } = useToast();
  const [showLocationNotice, setShowLocationNotice] = useState(true);
  
  // Check if it's the user's first visit after the change
  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('ai_features_location_notice');
    if (hasSeenNotice) {
      setShowLocationNotice(false);
    }
  }, []);
  
  const dismissNotice = () => {
    localStorage.setItem('ai_features_location_notice', 'true');
    setShowLocationNotice(false);
  };
  
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
      description: 'Extract and organize metadata from files, including dates, locations, people, and other contextual information.',
      icon: <FileImage className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o',
      status: 'working',
      badge: 'premium',
      isLoading: false
    },
    {
      id: 'content-detection',
      name: 'Image & Document Content Detection',
      description: 'Identify and categorize content within images and documents for more accurate file naming and organization.',
      icon: <Eye className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o',
      status: 'working',
      isLoading: false
    },
    {
      id: 'preview-workflow',
      name: 'Preview & Approval Workflow',
      description: 'Review suggested file names before applying changes, with multiple options to choose from.',
      icon: <Eye className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: false,
      model: '',
      status: 'working',
      isLoading: false
    },
    {
      id: 'local-ai',
      name: 'Local AI Model Support',
      description: 'Use locally-hosted Llama or Mistral models for enhanced privacy and offline usage.',
      icon: <Server className="w-5 h-5" />,
      enabled: false,
      requiresApiKey: false,
      model: '',
      status: 'maintenance',
      badge: 'beta',
      isLoading: false
    },
    {
      id: 'case-format',
      name: 'Intelligent Case & Format Handling',
      description: 'Automatically adjust casing, spacing, and special characters based on conventions and preferences.',
      icon: <Text className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: false,
      model: '',
      status: 'working',
      isLoading: false
    },
    {
      id: 'multi-language',
      name: 'Multi-Format and Multi-Language Support',
      description: 'Process files in any format and support for naming in multiple languages and scripts.',
      icon: <Globe className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'gpt_4o',
      status: 'working',
      isLoading: false
    },
    {
      id: 'duplicate-detection',
      name: 'Duplicate & Conflict Resolution',
      description: 'Detect and handle duplicate files with intelligent naming strategies to avoid conflicts.',
      icon: <Copy className="w-5 h-5" />,
      enabled: true,
      requiresApiKey: true,
      model: 'claude_3_5_sonnet',
      status: 'working',
      isLoading: false
    }
  ]);

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case 'new':
        return 'text-xs bg-blue-500 text-white';
      case 'beta':
        return 'text-xs bg-purple-500 text-white';
      case 'premium':
        return 'text-xs bg-yellow-500 text-white';
      default:
        return 'text-xs bg-gray-500 text-white';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'maintenance':
        return <Cog className="w-4 h-4 text-yellow-500" />;
      case 'deprecating':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working':
        return 'Operational';
      case 'maintenance':
        return 'Under Maintenance';
      case 'deprecating':
        return 'Deprecating Soon';
      default:
        return '';
    }
  };

  const handleToggle = (id: string) => {
    setFeatures(prevFeatures => 
      prevFeatures.map(feature => 
        feature.id === id 
          ? { ...feature, isLoading: true }
          : feature
      )
    );

    // Simulate API call
    setTimeout(() => {
      setFeatures(prevFeatures => 
        prevFeatures.map(feature => 
          feature.id === id 
            ? { ...feature, enabled: !feature.enabled, isLoading: false }
            : feature
        )
      );

      toast({
        title: "Feature updated",
        description: `Feature has been ${!features.find(f => f.id === id)?.enabled ? 'enabled' : 'disabled'}.`,
        variant: "default",
      });
    }, 800);
  };

  const testFeature = (id: string) => {
    toast({
      title: "Feature test initiated",
      description: "Testing feature functionality. Results will appear shortly.",
      variant: "default",
    });

    // Simulate test completion
    setTimeout(() => {
      toast({
        title: "Feature test complete",
        description: "Feature is working correctly.",
        variant: "default",
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {showLocationNotice && (
          <div className="bg-orange-950 border border-orange-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex gap-3">
              <Info className="text-orange-500 h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-white mb-1">Location Change</h3>
                <p className="text-orange-200 text-sm">AI Features have been moved from the Settings page to this dedicated page for easier access. All functionality is now available here.</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={dismissNotice} 
              className="text-orange-300 hover:text-orange-100 hover:bg-orange-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">AI Features</h1>
          <p className="text-gray-300 text-lg mb-6">
            Manage AI-powered features for your file renaming and organization experience
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-orange-500 mb-2">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-white mb-1">Intelligent Naming</h3>
              <p className="text-sm text-gray-400">Context-aware renaming that understands file content and extracts relevant information</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-orange-500 mb-2">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-white mb-1">Multi-Model Support</h3>
              <p className="text-sm text-gray-400">Choose from multiple AI models for different use cases and performance requirements</p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="text-orange-500 mb-2">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-white mb-1">Customizable Experience</h3>
              <p className="text-sm text-gray-400">Enable or disable specific AI features to match your workflow needs</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-6">
          <h2 className="text-xl font-bold mb-4 text-white">Feature Status</h2>
          
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
                          <span className="text-xs text-gray-400">
                            Uses <span className="text-orange-500 font-medium">{feature.model?.replace('_', ' ').toUpperCase()}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Switch 
                    checked={feature.enabled} 
                    disabled={feature.isLoading}
                    onCheckedChange={() => handleToggle(feature.id)}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
                
                <div className="ml-14 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {feature.status && getStatusIndicator(feature.status)}
                    <span className="text-xs text-gray-400">
                      Status: {feature.status && getStatusText(feature.status)}
                    </span>
                  </div>
                  
                  {feature.enabled && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-orange-500 hover:text-orange-400 hover:bg-zinc-900"
                      onClick={() => testFeature(feature.id)}
                    >
                      Test Feature
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AIFeaturesPage;