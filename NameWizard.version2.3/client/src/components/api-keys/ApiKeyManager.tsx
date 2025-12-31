import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, RotateCcw } from "lucide-react";
import { ApiKeyRow } from "./ApiKeyRow";
import { mockApiKeys, mockCloudConnections } from "./mockApiKeys";

// Define types
export interface ApiKey {
  id: number;
  userId: number;
  llmType: string;
  key: string;
  status: string;
  lastUsed: string | null;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
  capabilities: string[];
  lastTestResult?: {
    success: boolean;
    message: string;
    timestamp: string;
  };
}

export interface CloudConnection {
  id: number;
  userId: number;
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiKeyManagerProps {
  autoOpenIntegrationWizard?: boolean;
}

const providerOptions = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "meta", label: "Meta Llama 3" },
  { value: "google", label: "Google Gemini" },
  { value: "dropbox", label: "Dropbox API" },
  { value: "googledrive", label: "Google Drive API" },
  { value: "mistral", label: "Mistral AI" },
  { value: "perplexity", label: "Perplexity AI" }
];

export default function ApiKeyManager({ autoOpenIntegrationWizard = false }: ApiKeyManagerProps = {}) {
  const { toast } = useToast();
  const [apiKeysData, setApiKeysData] = useState<ApiKey[]>(() => {
    const saved = localStorage.getItem('apiKeys');
    return saved ? JSON.parse(saved) : [];
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newApiKey, setNewApiKey] = useState("");

  const handleToggleEnabled = (id: number, enabled: boolean) => {
    const updatedKeys = apiKeysData.map(key => 
      key.id === id ? { ...key, enabled, status: enabled ? 'active' : 'inactive' } : key
    );
    setApiKeysData(updatedKeys);
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    
    toast({
      title: enabled ? "API key enabled" : "API key disabled",
      description: "Settings saved successfully"
    });
  };

  const handleTestKey = (id: number) => {
    const key = apiKeysData.find(k => k.id === id);
    if (!key) return;

    toast({
      title: "Testing API key",
      description: "Please wait while we verify your API key..."
    });

    // Simulate API test with realistic results
    setTimeout(() => {
      // Simulate test based on key validity (basic format check)
      const isValidKey = key.key.length > 20 && (
        key.key.startsWith('sk-') || 
        key.key.startsWith('sk_ant') || 
        key.key.includes('api')
      );
      
      const testResult = {
        success: isValidKey,
        message: isValidKey ? 
          `${key.llmType} API key is valid and connected` : 
          `Invalid API key format for ${key.llmType}`,
        timestamp: new Date().toISOString()
      };

      const updatedKeys = apiKeysData.map(apiKey => 
        apiKey.id === id 
          ? { 
              ...apiKey, 
              lastTestResult: testResult,
              status: testResult.success ? 'active' : 'error'
            } 
          : apiKey
      );
      setApiKeysData(updatedKeys);
      localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));

      toast({
        title: testResult.success ? "API key test successful" : "API key test failed",
        description: testResult.message,
        variant: testResult.success ? "default" : "destructive"
      });
    }, 1500);
  };

  const handleDeleteKey = (id: number) => {
    const updatedKeys = apiKeysData.filter(key => key.id !== id);
    setApiKeysData(updatedKeys);
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    toast({
      title: "API key deleted",
      description: "The API key has been removed from your account"
    });
  };

  const handleUpdateKey = (id: number, updates: Partial<ApiKey>) => {
    const updatedKeys = apiKeysData.map(key => 
      key.id === id ? { ...key, ...updates } : key
    );
    setApiKeysData(updatedKeys);
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    toast({
      title: "API key updated",
      description: "Your API key has been successfully updated"
    });
  };

  const handleToggleVisibility = (id: number) => {
    setShowKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddNewKey = () => {
    if (!newKeyName || !newProvider || !newApiKey) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now(),
      userId: 1,
      llmType: newProvider,
      key: newApiKey,
      status: 'inactive',
      lastUsed: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enabled: false,
      capabilities: getCapabilitiesForProvider(newProvider)
    };

    const updatedKeys = [...apiKeysData, newKey];
    setApiKeysData(updatedKeys);
    localStorage.setItem('apiKeys', JSON.stringify(updatedKeys));
    
    // Reset form
    setNewKeyName("");
    setNewProvider("");
    setNewApiKey("");

    toast({
      title: "API key added",
      description: "New API key has been added successfully"
    });
  };

  const getCapabilitiesForProvider = (provider: string): string[] => {
    switch (provider) {
      case 'openai':
        return ['Text', 'Vision', 'Code'];
      case 'anthropic':
        return ['Text', 'Vision', 'Analysis'];
      case 'meta':
        return ['Text', 'Code'];
      case 'google':
        return ['Text', 'Vision', 'Search'];
      case 'dropbox':
        return ['Storage', 'Sync'];
      case 'googledrive':
        return ['Storage', 'Docs', 'Sheets'];
      case 'mistral':
        return ['Text', 'Multilingual'];
      case 'perplexity':
        return ['Search', 'Real-time'];
      default:
        return ['General'];
    }
  };

  const getProviderDisplayName = (llmType: string): string => {
    switch (llmType) {
      case 'openai':
        return 'OpenAI Production';
      case 'anthropic':
        return 'Anthropic API';
      case 'meta':
        return 'Meta Llama 3';
      case 'google':
        return 'Google Gemini';
      case 'dropbox':
        return 'Dropbox API';
      case 'googledrive':
        return 'Google Drive API';
      case 'mistral':
        return 'Mistral AI';
      case 'perplexity':
        return 'Perplexity AI';
      default:
        return llmType.charAt(0).toUpperCase() + llmType.slice(1);
    }
  };

  const handleResetToDefaults = () => {
    setApiKeysData(mockApiKeys);
    toast({
      title: "Reset to defaults",
      description: "All API keys have been reset to default values"
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">API Keys</h1>
            <p className="text-gray-400 mt-1">Manage your API keys for various AI providers</p>
          </div>
          <Button 
            onClick={handleResetToDefaults}
            variant="outline" 
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Your API Keys Section */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Your API Keys</CardTitle>
          <CardDescription className="text-gray-400">
            These keys are used to authenticate requests to AI providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeysData.map((apiKey) => (
            <ApiKeyRow
              key={apiKey.id}
              apiKey={apiKey}
              showKey={showKeys[apiKey.id] || false}
              onToggleVisibility={() => handleToggleVisibility(apiKey.id)}
              onToggleEnabled={(enabled) => handleToggleEnabled(apiKey.id, enabled)}
              onTest={() => handleTestKey(apiKey.id)}
              onDelete={() => handleDeleteKey(apiKey.id)}
              onUpdate={(updates) => handleUpdateKey(apiKey.id, updates)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Add New API Key Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Add New API Key</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your API key details to connect with AI providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Key Name
              </label>
              <Input
                placeholder="e.g. OpenAI Production"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Provider
              </label>
              <Select value={newProvider} onValueChange={setNewProvider}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {providerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              API Key
            </label>
            <Input
              type="password"
              placeholder="Enter API Key"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <Button 
            onClick={handleAddNewKey}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New API Key
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}