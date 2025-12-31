import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Key, Copy, RefreshCw, Trash2, Check, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: number;
  name: string;
  key: string;
  llmType: string;
  status: 'active' | 'inactive' | 'problem';
  createdAt: string;
  lastUsed?: string;
  description?: string;
  provider?: 'openai' | 'anthropic' | 'meta' | 'google' | 'local';
  capabilities?: string[];
  isDefault?: boolean;
  isLoading?: boolean;
}

const ApiKeysSection: React.FC = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 1,
      name: 'OpenAI API Key',
      key: 'sk_1234...5678',
      llmType: 'gpt_4o',
      status: 'active',
      createdAt: '2025-04-01T12:00:00Z',
      lastUsed: '2025-04-16T08:23:45Z',
      description: 'Advanced vision-language model with strong multimodal capabilities. Best for analyzing images and complex content.',
      provider: 'openai',
      capabilities: ['Text', 'Images', 'Code', 'Audio'],
      isDefault: true
    },
    {
      id: 2,
      name: 'Claude API Key',
      key: 'sk_8765...4321',
      llmType: 'claude_3_5_sonnet',
      status: 'inactive',
      createdAt: '2025-03-15T09:30:00Z',
      lastUsed: '2025-04-10T14:22:10Z',
      description: 'Anthropic\'s most advanced model with exceptional reasoning capabilities for complex renaming tasks.',
      provider: 'anthropic',
      capabilities: ['Text', 'Images', 'Code'],
      isDefault: false
    },
    {
      id: 3,
      name: 'Llama 3 API Key',
      key: 'sk_9876...1234',
      llmType: 'llama_3_70b',
      status: 'problem',
      createdAt: '2025-04-05T16:45:00Z',
      lastUsed: '2025-04-15T19:10:33Z',
      description: 'High-performance open-source model with good balance of quality and speed.',
      provider: 'meta',
      capabilities: ['Text'],
      isDefault: false
    },
    {
      id: 4,
      name: 'Llava 1.6 API Key',
      key: 'sk_llava...9876',
      llmType: 'llava_1_6',
      status: 'active',
      createdAt: '2025-04-20T14:30:00Z',
      lastUsed: '2025-04-23T09:15:20Z',
      description: 'Open-source vision-language model with robust image understanding and text generation capabilities.',
      provider: 'meta',
      capabilities: ['Text', 'Images'],
      isDefault: false
    },
  ]);
  
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    llmType: ''
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleModelChange = (value: string) => {
    setFormData(prev => ({ ...prev, llmType: value }));
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to clipboard",
      variant: "default",
    });
  };
  
  const toggleStatus = (id: number) => {
    setApiKeys(keys => keys.map(key => {
      if (key.id === id) {
        const newStatus = key.status === 'active' ? 'inactive' : 'active';
        return { ...key, status: newStatus };
      }
      return key;
    }));
    
    toast({
      title: "Status updated",
      description: "API key status has been updated",
      variant: "default",
    });
  };
  
  const setDefaultModel = (id: number) => {
    setApiKeys(keys => keys.map(key => ({
      ...key,
      isDefault: key.id === id
    })));
    
    const model = apiKeys.find(key => key.id === id);
    toast({
      title: "Default model updated",
      description: `${getModelDisplay(model?.llmType || '')} is now your default AI model for file renaming`,
      variant: "default",
    });
  };
  
  const regenerateKey = (id: number) => {
    setApiKeys(keys => keys.map(key => {
      if (key.id === id) {
        // In a real app, we would call an API to regenerate the key
        const randomString = Math.random().toString(36).substring(2, 10);
        return { ...key, key: `sk_${randomString}...${randomString.split('').reverse().join('')}` };
      }
      return key;
    }));
    
    toast({
      title: "Key regenerated",
      description: "API key has been regenerated",
      variant: "default",
    });
  };
  
  const deleteKey = (id: number) => {
    setApiKeys(keys => keys.filter(key => key.id !== id));
    
    toast({
      title: "Key deleted",
      description: "API key has been deleted",
      variant: "default",
    });
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.key || !formData.llmType) {
      toast({
        title: "Missing fields",
        description: "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }
    
    // Determine provider and capabilities based on model type
    let provider: 'openai' | 'anthropic' | 'meta' | 'google' | 'local' = 'openai';
    let capabilities: string[] = ['Text'];
    let description = '';
    
    if (formData.llmType.includes('gpt')) {
      provider = 'openai';
      if (formData.llmType === 'gpt_4o') {
        capabilities = ['Text', 'Images', 'Code', 'Audio'];
        description = 'Advanced vision-language model with strong multimodal capabilities. Best for analyzing images and complex content.';
      } else if (formData.llmType === 'gpt_4o_mini') {
        capabilities = ['Text', 'Images', 'Code'];
        description = 'Smaller, faster version of GPT-4o with good balance of speed and quality. Ideal for simpler renaming.';
      } else if (formData.llmType === 'gpt_4_turbo') {
        capabilities = ['Text', 'Code'];
        description = 'Powerful model for complex content analysis with balanced performance and cost.';
      } else if (formData.llmType === 'gpt_3_5_turbo') {
        capabilities = ['Text'];
        description = 'Cost-effective model for basic renaming tasks. Limited content analysis capabilities.';
      }
    } else if (formData.llmType.includes('claude')) {
      provider = 'anthropic';
      capabilities = ['Text', 'Images', 'Code'];
      description = 'Anthropic\'s most advanced model with exceptional reasoning capabilities for complex renaming tasks.';
    } else if (formData.llmType.includes('llama')) {
      provider = 'meta';
      if (formData.llmType === 'llama_3_2_90b') {
        capabilities = ['Text', 'Code'];
        description = 'Meta\'s largest model with strong reasoning capabilities for complex naming patterns.';
      } else {
        capabilities = ['Text'];
        description = 'High-performance open-source model with good balance of quality and speed.';
      }
    } else if (formData.llmType.includes('llava')) {
      provider = 'meta';
      capabilities = ['Text', 'Images'];
      description = 'Open-source vision-language model with robust image understanding and text generation capabilities.';
    } else if (formData.llmType.includes('gemini')) {
      provider = 'google';
      capabilities = ['Text', 'Images', 'Code', 'Audio'];
      description = 'Google\'s state-of-the-art model with strong multimodal capabilities for diverse file types.';
    } else if (formData.llmType.includes('ollama')) {
      provider = 'local';
      capabilities = ['Text'];
      description = 'Run models locally for full privacy. Requires additional setup and configuration.';
    }
    
    // Add new API key
    const newKey = {
      id: Date.now(),
      name: formData.name,
      key: formData.key,
      llmType: formData.llmType,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      provider,
      capabilities,
      description,
      isDefault: apiKeys.length === 0 // Make it default if it's the first key
    };
    
    setApiKeys(prev => [...prev, newKey]);
    setFormData({ name: '', key: '', llmType: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "API key added",
      description: "New API key has been added",
      variant: "default",
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-500 text-xs">Active</span>
          </div>
        );
      case 'inactive':
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-yellow-500 text-xs">Inactive</span>
          </div>
        );
      case 'problem':
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-500 text-xs">Problem</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  const getModelDisplay = (llmType: string) => {
    const models: {[key: string]: string} = {
      'gpt_4o': 'GPT-4o',
      'gpt_4o_mini': 'GPT-4o mini',
      'gpt_4_turbo': 'GPT-4 Turbo',
      'gpt_3_5_turbo': 'GPT-3.5 Turbo',
      'claude_3_5_sonnet': 'Claude 3.5 Sonnet',
      'llama_3': 'Llama 3',
      'llama_3_70b': 'Llama 3 70B',
      'llama_3_2_90b': 'Llama 3.2 90B',
      'llava_1_6': 'Llava 1.6',
      'inflection_2_5': 'Inflection-2.5',
      'gemini_1_5_pro': 'Gemini 1.5 Pro',
      'ollama': 'Ollama (Local)'
    };
    
    return models[llmType] || llmType;
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">API Keys</h2>
          <p className="text-zinc-400 text-sm">Manage your API keys for LLM integrations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Enter your API key details for a new LLM integration.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Key Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., My OpenAI API Key"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              
              <div>
                <Label htmlFor="llmType">LLM Type</Label>
                <Select value={formData.llmType} onValueChange={handleModelChange}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Select LLM Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt_4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt_4o_mini">GPT-4o mini</SelectItem>
                    <SelectItem value="gpt_4_turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt_3_5_turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude_3_5_sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="llama_3">Llama 3</SelectItem>
                    <SelectItem value="llama_3_70b">Llama 3 70B</SelectItem>
                    <SelectItem value="llama_3_2_90b">Llama 3.2 90B</SelectItem>
                    <SelectItem value="llava_1_6">Llava 1.6</SelectItem>
                    <SelectItem value="inflection_2_5">Inflection-2.5</SelectItem>
                    <SelectItem value="gemini_1_5_pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="ollama">Ollama (Local)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="key">API Key</Label>
                <Input 
                  id="key" 
                  name="key" 
                  value={formData.key}
                  onChange={handleChange}
                  placeholder="sk-..."
                  type="password"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Add Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {apiKeys.map(key => (
          <div key={key.id} className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-orange-500" />
                  <h3 className="font-medium">{key.name}</h3>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-${key.provider === 'openai' ? 'blue' : key.provider === 'anthropic' ? 'indigo' : key.provider === 'meta' ? 'pink' : key.provider === 'google' ? 'emerald' : 'amber'}-500 text-xs font-medium`}>
                    {getModelDisplay(key.llmType)}
                  </span>
                  <span className="text-zinc-500 text-xs">|</span>
                  <span className="text-zinc-400 text-xs">
                    Added {new Date(key.createdAt).toLocaleDateString()}
                  </span>
                  {key.lastUsed && (
                    <>
                      <span className="text-zinc-500 text-xs">|</span>
                      <span className="text-zinc-400 text-xs">
                        Last used {new Date(key.lastUsed).toLocaleDateString()}
                      </span>
                    </>
                  )}
                  {key.isDefault && (
                    <>
                      <span className="text-zinc-500 text-xs">|</span>
                      <span className="text-orange-500 text-xs font-medium flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Default
                      </span>
                    </>
                  )}
                </div>
                
                {key.description && (
                  <div className="text-sm text-zinc-400 mb-2">
                    {key.description}
                  </div>
                )}
                
                {key.capabilities && key.capabilities.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    {key.capabilities.map((capability, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs">
                        {capability}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-900 py-1 px-2 rounded text-zinc-400 text-sm font-mono flex items-center">
                    {key.key}
                    <button 
                      onClick={() => copyToClipboard(key.key)}
                      className="ml-2 text-zinc-500 hover:text-zinc-300"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {getStatusBadge(key.status)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleStatus(key.id)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  {key.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
                
                {!key.isDefault && key.status === 'active' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDefaultModel(key.id)}
                    className="border-orange-600 text-orange-500 hover:bg-orange-950 hover:text-orange-400"
                  >
                    <Check className="w-3 h-3 mr-2" />
                    Set as Default
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => regenerateKey(key.id)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Regenerate
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-900 bg-red-950 text-red-400 hover:bg-red-900 hover:text-red-200"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Any services using this API key will no longer work.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteKey(key.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
        
        {apiKeys.length === 0 && (
          <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-800 text-center">
            <Key className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-xl font-medium mb-2">No API Keys</h3>
            <p className="text-zinc-400 mb-4">
              You haven't added any API keys yet. Add a key to use with AI features.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Key
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeysSection;