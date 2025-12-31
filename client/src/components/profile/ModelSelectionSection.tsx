import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BrainCog, CheckCircle, Activity, Brain } from 'lucide-react';
import { formatModelName } from '@/utils/modelUtils';
import { BrainIcon } from '@/components/icons';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

// This key is used to persist model selections in localStorage
const MODEL_STORAGE_KEY = 'nameWizard_modelPreferences';

interface Model {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  status: 'available' | 'limited' | 'unavailable';
  provider: 'openai' | 'anthropic' | 'meta' | 'google' | 'local';
  capabilities: string[];
  isLoading?: boolean;
}

const ModelSelectionSection: React.FC = () => {
  const { toast } = useToast();
  const [selectedDefaultModel, setSelectedDefaultModel] = useState('gpt_4o');
  
  // Load saved model settings on component mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem(MODEL_STORAGE_KEY);
      if (savedPreferences) {
        const parsedPreferences = JSON.parse(savedPreferences);
        setSelectedDefaultModel(parsedPreferences.defaultModel || 'gpt_4o');
        
        // If we have saved model statuses, apply them
        if (parsedPreferences.modelStatuses) {
          setModels(prevModels => 
            prevModels.map(model => ({
              ...model,
              isDefault: model.id === parsedPreferences.defaultModel,
              status: parsedPreferences.modelStatuses[model.id]?.status || model.status,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading saved model preferences:', error);
    }
  }, []);
  
  const [models, setModels] = useState<Model[]>([
    {
      id: 'gpt_4o',
      name: 'GPT-4o',
      description: 'Advanced vision-language model with strong multimodal capabilities. Best for analyzing images and complex content.',
      isDefault: true,
      status: 'available',
      provider: 'openai',
      capabilities: ['Text', 'Images', 'Code', 'Audio'],
      isLoading: false
    },
    {
      id: 'llava_1_6',
      name: 'Llava 1.6',
      description: 'Open-source vision-language model with robust image understanding and text generation capabilities.',
      isDefault: false,
      status: 'available',
      provider: 'meta',
      capabilities: ['Text', 'Images'],
      isLoading: false
    },
    {
      id: 'claude_3_7_sonnet',
      name: 'Claude 3.5 Sonnet',
      description: 'Anthropic\'s most advanced model with exceptional reasoning capabilities for complex renaming tasks.',
      isDefault: false,
      status: 'available',
      provider: 'anthropic',
      capabilities: ['Text', 'Images', 'Code'],
      isLoading: false
    },
    {
      id: 'gpt_4o_mini',
      name: 'GPT-4o Mini',
      description: 'Smaller, faster version of GPT-4o with good balance of speed and quality. Ideal for simpler renaming.',
      isDefault: false,
      status: 'available',
      provider: 'openai',
      capabilities: ['Text', 'Images', 'Code'],
      isLoading: false
    },
    {
      id: 'gpt_4_turbo',
      name: 'GPT-4 Turbo',
      description: 'Powerful model for complex content analysis with balanced performance and cost.',
      isDefault: false,
      status: 'available',
      provider: 'openai',
      capabilities: ['Text', 'Code'],
      isLoading: false
    },
    {
      id: 'gpt_3_5_turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Cost-effective model for basic renaming tasks. Limited content analysis capabilities.',
      isDefault: false,
      status: 'available',
      provider: 'openai',
      capabilities: ['Text'],
      isLoading: false
    },
    {
      id: 'llama_3_2_90b',
      name: 'Llama 3.2 90B',
      description: 'Meta\'s largest model with strong reasoning capabilities for complex naming patterns.',
      isDefault: false,
      status: 'available',
      provider: 'meta',
      capabilities: ['Text', 'Code'],
      isLoading: false
    },
    {
      id: 'llama_3_70b',
      name: 'Llama 3 70B',
      description: 'High-performance open-source model with good balance of quality and speed.',
      isDefault: false,
      status: 'limited',
      provider: 'meta',
      capabilities: ['Text'],
      isLoading: false
    },
    {
      id: 'gemini_1_5_pro',
      name: 'Gemini 1.5 Pro',
      description: 'Google\'s state-of-the-art model with strong multimodal capabilities for diverse file types.',
      isDefault: false,
      status: 'available',
      provider: 'google',
      capabilities: ['Text', 'Images', 'Code', 'Audio'],
      isLoading: false
    },
    {
      id: 'ollama',
      name: 'Ollama (Local)',
      description: 'Run models locally for full privacy. Requires additional setup and configuration.',
      isDefault: false,
      status: 'limited',
      provider: 'local',
      capabilities: ['Text'],
      isLoading: false
    }
  ]);

  // Save current model state to localStorage
  const saveModelPreferences = (currentModels: Model[], defaultModel: string) => {
    try {
      // Create a map of model statuses
      const modelStatuses = currentModels.reduce((acc, model) => {
        acc[model.id] = {
          status: model.status,
          isDefault: model.id === defaultModel
        };
        return acc;
      }, {} as Record<string, { status: string, isDefault: boolean }>);
      
      // Save to localStorage
      localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify({
        defaultModel,
        modelStatuses,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving model preferences:', error);
    }
  };
  
  const setDefaultModel = (modelId: string) => {
    setSelectedDefaultModel(modelId);
    
    const updatedModels = models.map(model => ({
      ...model,
      isDefault: model.id === modelId
    }));
    
    setModels(updatedModels);
    
    // Save preferences to localStorage
    saveModelPreferences(updatedModels, modelId);
    
    // Show success message
    const model = models.find(m => m.id === modelId);
    toast({
      title: 'Default model updated',
      description: `${model?.name} is now your default AI model for file renaming`,
      variant: "default",
    });
  };
  
  const testModel = async (modelId: string) => {
    // Set loading state
    setModels(prevModels => 
      prevModels.map(model => 
        model.id === modelId ? { ...model, isLoading: true } : model
      )
    );
    
    try {
      // Simulate API call to test model
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Randomly determine success/failure for demo purposes (in real app, would be actual API response)
      const success = Math.random() > 0.2;
      
      // Update model status
      const updatedModels = models.map(model => 
        model.id === modelId ? { 
          ...model, 
          isLoading: false, 
          status: (success ? 'available' : 'unavailable') as 'available' | 'limited' | 'unavailable'
        } : model
      ) as Model[];
      
      setModels(updatedModels);
      
      // Save updated statuses to localStorage
      saveModelPreferences(updatedModels, selectedDefaultModel);
      
      const model = models.find(m => m.id === modelId);
      
      toast({
        title: success ? 'Model test successful' : 'Model test failed',
        description: success 
          ? `${model?.name} is available and working correctly` 
          : `${model?.name} test failed. Please check API key or try again.`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      // Handle errors
      const updatedModels = models.map(model => 
        model.id === modelId ? { ...model, isLoading: false, status: 'unavailable' as 'available' | 'limited' | 'unavailable' } : model
      ) as Model[];
      
      setModels(updatedModels);
      
      // Save updated statuses to localStorage
      saveModelPreferences(updatedModels, selectedDefaultModel);
      
      toast({
        title: 'Test error',
        description: 'An error occurred while testing the model',
        variant: "destructive",
      });
    }
  };

  // Get provider logo/icon based on provider name
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return <div className="text-green-500 text-xs font-semibold">OpenAI</div>;
      case 'anthropic':
        return <div className="text-purple-500 text-xs font-semibold">Anthropic</div>;
      case 'meta':
        return <div className="text-blue-500 text-xs font-semibold">Meta</div>;
      case 'google':
        return <div className="text-red-500 text-xs font-semibold">Google</div>;
      case 'local':
        return <div className="text-gray-400 text-xs font-semibold">Local</div>;
      default:
        return null;
    }
  };

  // Function to determine status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'limited':
        return 'bg-yellow-500';
      case 'unavailable':
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">AI Model Selection</h2>
        <p className="text-gray-300 text-sm">Configure which AI models to use for file analysis and renaming operations</p>
      </div>
      
      <div className="mb-6 p-5 border border-orange-500/30 bg-orange-500/5 rounded-lg">
        <div className="flex gap-3 items-start">
          <BrainIcon className="w-5 h-5 text-orange-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-1">Default AI Model</h3>
            <p className="text-sm text-gray-300">
              Your default model for all AI operations is currently set to <span className="text-orange-500 font-medium">{formatModelName(selectedDefaultModel)}</span>. This model will be used for all file analysis and renaming unless explicitly overridden.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {models.map((model) => (
          <div key={model.id} className={`bg-zinc-950 rounded-lg p-6 border ${model.isDefault ? 'border-orange-500' : 'border-zinc-800'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full ${model.isDefault ? 'bg-orange-950 text-orange-500' : 'bg-zinc-900 text-zinc-400'} flex items-center justify-center`}>
                  <BrainCog className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{model.name}</h3>
                    {model.isDefault && (
                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">DEFAULT</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{model.description}</p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    {getProviderIcon(model.provider)}
                    <div className="flex items-center gap-1">
                      {model.capabilities.map((capability, index) => (
                        <span key={index} className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-300 rounded">
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                {!model.isDefault ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-orange-500 text-orange-500 hover:bg-orange-950 hover:text-orange-400"
                    onClick={() => setDefaultModel(model.id)}
                  >
                    Set Default
                  </Button>
                ) : (
                  <div className="px-3 py-1 rounded-md bg-orange-500 bg-opacity-10 text-orange-500 text-xs font-medium">
                    Current Default
                  </div>
                )}
              </div>
            </div>
            
            {/* Model controls and status */}
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(model.status)} animate-pulse`}></div>
                <span className="text-sm text-gray-300">
                  Status: {model.status === 'available' ? 'Available' : model.status === 'limited' ? 'Limited Availability' : 'Unavailable'}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => testModel(model.id)}
                disabled={model.isLoading}
              >
                {model.isLoading ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test Connection
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

export default ModelSelectionSection;