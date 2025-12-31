import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ArrowRight, CheckCircle2, CircleSlash, ExternalLink, HelpCircle, Zap, Loader2, RotateCcw, Save, Sparkle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface Provider {
  id: string;
  name: string;
  logo: React.ReactNode;
  description: string;
  apiKeyPlaceholder: string;
  apiKeyPattern: string;
  helpUrl: string;
  models: {
    id: string;
    name: string;
    description: string;
    isDefault?: boolean;
  }[];
}

interface ProviderIntegrationWizardProps {
  onSaveKeys: (keys: { provider: string; key: string; model: string }[]) => void;
  autoOpen?: boolean;
}

export default function ProviderIntegrationWizard({ onSaveKeys, autoOpen = false }: ProviderIntegrationWizardProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(autoOpen);
  const [step, setStep] = useState(1);
  
  // Auto open effect
  useEffect(() => {
    if (autoOpen) {
      setIsWizardOpen(true);
    }
  }, [autoOpen]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, 'success' | 'error' | null>>({});

  const providers: Provider[] = [
    {
      id: 'openai',
      name: 'OpenAI',
      logo: <span className="text-green-500 font-bold">OpenAI</span>,
      description: 'Access GPT-4o, GPT-4o mini, GPT-3.5 Turbo and more',
      apiKeyPlaceholder: 'sk-...',
      apiKeyPattern: '^sk-[a-zA-Z0-9]{48}$',
      helpUrl: 'https://platform.openai.com/account/api-keys',
      models: [
        { id: 'gpt_4o', name: 'GPT-4o', description: 'Most powerful, multimodal model', isDefault: true },
        { id: 'gpt_4o_mini', name: 'GPT-4o Mini', description: 'Efficient multimodal model' },
        { id: 'gpt_4_turbo', name: 'GPT-4 Turbo', description: 'Advanced model with context window up to 128k tokens' },
        { id: 'gpt_3_5_turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective' }
      ]
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      logo: <span className="text-purple-500 font-bold">Anthropic</span>,
      description: 'Access Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku and more',
      apiKeyPlaceholder: 'sk-ant-...',
      apiKeyPattern: '^sk-ant-api\\d+-[a-zA-Z0-9]{24,48}$',
      helpUrl: 'https://console.anthropic.com/settings/keys',
      models: [
        { id: 'claude_3_5_sonnet', name: 'Claude 3.5 Sonnet', description: 'Latest multimodal model with fast and efficient processing', isDefault: true },
        { id: 'claude_3_opus', name: 'Claude 3 Opus', description: 'Most powerful Claude model for complex tasks' },
        { id: 'claude_3_sonnet', name: 'Claude 3 Sonnet', description: 'Balanced version of Claude 3' },
        { id: 'claude_3_haiku', name: 'Claude 3 Haiku', description: 'Fastest Claude model' },
      ]
    },
    {
      id: 'google',
      name: 'Google AI',
      logo: <span className="text-blue-500 font-bold">Google AI</span>,
      description: 'Access Gemini 1.5 Pro, Gemini 1.5 Flash and more',
      apiKeyPlaceholder: 'API key from Google AI Studio',
      apiKeyPattern: '^[a-zA-Z0-9_-]{39}$',
      helpUrl: 'https://aistudio.google.com/app/apikey',
      models: [
        { id: 'gemini_1_5_pro', name: 'Gemini 1.5 Pro', description: 'Most capable Gemini model with 1M token context', isDefault: true },
        { id: 'gemini_1_5_flash', name: 'Gemini 1.5 Flash', description: 'Fast and cost-effective Gemini model' },
      ]
    },
  ];

  const handleProviderSelect = (providerId: string) => {
    setSelectedProviders(prev => {
      if (prev.includes(providerId)) {
        return prev.filter(id => id !== providerId);
      } else {
        return [...prev, providerId];
      }
    });
  };

  const handleInputChange = (providerId: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [providerId]: value
    }));
  };

  const handleModelSelect = (providerId: string, modelId: string) => {
    setSelectedModels(prev => ({
      ...prev,
      [providerId]: modelId
    }));
  };

  const handleNext = () => {
    if (step === 1 && selectedProviders.length === 0) {
      toast({
        title: "No providers selected",
        description: "Please select at least one provider to continue",
        variant: "destructive"
      });
      return;
    }

    if (step === 2) {
      // Validate API keys
      let isValid = true;
      const missingKeys = selectedProviders.filter(id => !apiKeys[id] || apiKeys[id].trim() === '');
      
      if (missingKeys.length > 0) {
        toast({
          title: "Missing API keys",
          description: `Please enter API keys for: ${missingKeys.map(id => providers.find(p => p.id === id)?.name).join(', ')}`,
          variant: "destructive"
        });
        isValid = false;
      }

      const invalidFormatKeys = selectedProviders.filter(id => {
        const provider = providers.find(p => p.id === id);
        if (!provider || !apiKeys[id]) return false;
        
        try {
          return !new RegExp(provider.apiKeyPattern).test(apiKeys[id]);
        } catch (e) {
          return false;
        }
      });

      if (invalidFormatKeys.length > 0 && isValid) {
        toast({
          title: "Invalid API key format",
          description: `Please check the format of API keys for: ${invalidFormatKeys.map(id => providers.find(p => p.id === id)?.name).join(', ')}`,
          variant: "destructive"
        });
        isValid = false;
      }

      if (!isValid) return;
    }

    if (step === 3) {
      // Set default models for providers without selection
      const updatedModels = { ...selectedModels };
      selectedProviders.forEach(providerId => {
        if (!updatedModels[providerId]) {
          const defaultModel = providers.find(p => p.id === providerId)?.models.find(m => m.isDefault);
          if (defaultModel) {
            updatedModels[providerId] = defaultModel.id;
          }
        }
      });
      setSelectedModels(updatedModels);

      // Start integration process
      handleStartIntegration(updatedModels);
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleStartIntegration = async (modelSelections: Record<string, string>) => {
    setIsProcessing(true);
    setProgress(0);
    setResults({});

    const selectedProviderIds = [...selectedProviders];
    
    // Simulate a multi-step API integration process with progress
    for (let i = 0; i < selectedProviderIds.length; i++) {
      const providerId = selectedProviderIds[i];
      const progressStep = 100 / selectedProviderIds.length;
      
      // Simulate testing connection
      setProgress(Math.min(100, (i * progressStep) + 10));
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate validating API key
      setProgress(Math.min(100, (i * progressStep) + 20));
      await new Promise(resolve => setTimeout(resolve, 600));

      // Simulate setting up model access
      setProgress(Math.min(100, (i * progressStep) + progressStep - 10));
      await new Promise(resolve => setTimeout(resolve, 700));

      // Determine result (simulate 10% failure rate for demo)
      const isSuccess = Math.random() > 0.1;
      setResults(prev => ({
        ...prev,
        [providerId]: isSuccess ? 'success' : 'error'
      }));
      
      setProgress(Math.min(100, (i + 1) * progressStep));
    }

    // Finish the process
    setTimeout(() => {
      setIsProcessing(false);
      setStep(5); // Move to completion step
    }, 500);
  };

  const handleFinish = () => {
    // Collect successful integrations
    const successfulIntegrations = selectedProviders.filter(
      provider => results[provider] === 'success'
    ).map(provider => ({
      provider,
      key: apiKeys[provider],
      model: selectedModels[provider]
    }));
    
    if (successfulIntegrations.length > 0) {
      onSaveKeys(successfulIntegrations);
      toast({
        title: "Integration Complete",
        description: `Successfully integrated ${successfulIntegrations.length} providers`,
      });
    }
    
    // Reset wizard state
    setIsWizardOpen(false);
    setStep(1);
    setSelectedProviders([]);
    setApiKeys({});
    setSelectedModels({});
    setResults({});
  };

  const handleCancel = () => {
    if (step > 3 && isProcessing) {
      toast({
        title: "Process in progress",
        description: "Please wait for the current process to complete",
        variant: "destructive"
      });
      return;
    }
    
    setIsWizardOpen(false);
    setStep(1);
    setSelectedProviders([]);
    setApiKeys({});
    setSelectedModels({});
    setResults({});
  };

  return (
    <>
      <Sheet open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <SheetTrigger asChild>
          <Button className="gap-2 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white shadow-md">
            <Zap className="h-4 w-4" />
            One-Click Integration
          </Button>
        </SheetTrigger>
        
        <SheetContent className="sm:max-w-md md:max-w-xl" side="right">
          <SheetHeader>
            <SheetTitle className="text-2xl flex items-center gap-2">
              <Sparkle className="h-5 w-5 text-orange-500" />
              Provider Integration Wizard
            </SheetTitle>
            <SheetDescription>
              Quickly set up connections to multiple AI models with just a few clicks
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            {/* Step indication */}
            <div className="flex justify-between mb-6">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${step === stepNumber ? 'bg-orange-500 text-white' : 
                        step > stepNumber ? 'bg-orange-100 text-orange-500' : 
                        'bg-gray-100 text-gray-400'}`}
                  >
                    {step > stepNumber ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
                  </div>
                  <div className={`text-xs mt-1 ${step === stepNumber ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>
                    {stepNumber === 1 ? 'Select' : 
                     stepNumber === 2 ? 'Configure' : 
                     stepNumber === 3 ? 'Models' :
                     stepNumber === 4 ? 'Integrate' : 'Complete'}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />
            
            {/* Step 1: Select Providers */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Select AI Providers</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Choose which AI providers you want to integrate with your application
                </p>
                
                <div className="grid gap-3">
                  {providers.map((provider) => (
                    <Card key={provider.id} className={`cursor-pointer border transition-all ${
                      selectedProviders.includes(provider.id) ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200'
                    }`}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {provider.logo}
                            <CardTitle className="text-base">{provider.name}</CardTitle>
                          </div>
                          <Checkbox 
                            checked={selectedProviders.includes(provider.id)} 
                            onCheckedChange={() => handleProviderSelect(provider.id)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-600">{provider.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 2: Enter API Keys */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Enter API Keys</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Provide API keys for each selected provider
                </p>
                
                <div className="space-y-4">
                  {selectedProviders.map((providerId) => {
                    const provider = providers.find(p => p.id === providerId);
                    if (!provider) return null;
                    
                    return (
                      <div key={providerId} className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor={`${providerId}-key`} className="font-medium">
                            {provider.name} API Key
                          </Label>
                          <a 
                            href={provider.helpUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs flex items-center text-blue-500 hover:text-blue-700"
                          >
                            Get API Key <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                        <Input
                          id={`${providerId}-key`}
                          type="password"
                          placeholder={provider.apiKeyPlaceholder}
                          value={apiKeys[providerId] || ''}
                          onChange={(e) => handleInputChange(providerId, e.target.value)}
                          className="font-mono"
                        />
                        <p className="text-xs text-gray-500">
                          Used to connect to the {provider.name} API and access their models
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Step 3: Select Models */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Select Default Models</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Choose which model you want to use by default for each provider
                </p>
                
                <div className="space-y-6">
                  {selectedProviders.map((providerId) => {
                    const provider = providers.find(p => p.id === providerId);
                    if (!provider) return null;
                    
                    return (
                      <div key={providerId} className="space-y-3">
                        <h4 className="font-medium">{provider.name} Models</h4>
                        <div className="grid gap-2">
                          {provider.models.map((model) => (
                            <div 
                              key={model.id}
                              className={`flex items-center justify-between border rounded-md p-3 cursor-pointer transition-all ${
                                selectedModels[providerId] === model.id || 
                                (!selectedModels[providerId] && model.isDefault)
                                  ? 'border-orange-500 bg-orange-50/50'
                                  : 'border-gray-200'
                              }`}
                              onClick={() => handleModelSelect(providerId, model.id)}
                            >
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-sm text-gray-500">{model.description}</div>
                              </div>
                              <Checkbox 
                                checked={selectedModels[providerId] === model.id || 
                                        (!selectedModels[providerId] && model.isDefault)}
                                onCheckedChange={() => handleModelSelect(providerId, model.id)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Step 4: Integration Process */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Integration Process</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Setting up connections to your selected providers
                </p>
                
                <Progress value={progress} className="h-2 mb-4" />
                
                <div className="space-y-4">
                  {selectedProviders.map((providerId) => {
                    const provider = providers.find(p => p.id === providerId);
                    if (!provider) return null;
                    
                    const status = results[providerId];
                    const isComplete = status === 'success' || status === 'error';
                    const isCurrentlyProcessing = !isComplete && isProcessing;
                    
                    return (
                      <div key={providerId} className="flex items-center justify-between border rounded-md p-3">
                        <div className="flex items-center gap-3">
                          {isComplete ? (
                            status === 'success' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <CircleSlash className="h-5 w-5 text-red-500" />
                            )
                          ) : isCurrentlyProcessing ? (
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          )}
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-gray-500">
                              {isComplete 
                                ? status === 'success' 
                                  ? 'Successfully integrated' 
                                  : 'Integration failed'
                                : isCurrentlyProcessing
                                  ? 'Processing...'
                                  : 'Waiting...'}
                            </div>
                          </div>
                        </div>
                        
                        {isComplete && status === 'error' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Update the results state to set this provider's result to null
                              setResults(prev => ({
                                ...prev,
                                [providerId]: null
                              }));
                            }}
                            disabled={isProcessing}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {Object.keys(results).length === selectedProviders.length && !isProcessing && (
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => setStep(5)}>
                      Continue to Results <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Step 5: Completion */}
            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Integration Complete</h3>
                
                {Object.values(results).some(r => r === 'success') ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Integration Successful</h4>
                    </div>
                    <p className="text-sm">
                      {Object.values(results).filter(r => r === 'success').length} out of {selectedProviders.length} providers were successfully integrated.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CircleSlash className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium">Integration Failed</h4>
                    </div>
                    <p className="text-sm">
                      No providers were successfully integrated. Please check your API keys and try again.
                    </p>
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Integration Results</h4>
                  <div className="space-y-2">
                    {selectedProviders.map((providerId) => {
                      const provider = providers.find(p => p.id === providerId);
                      if (!provider) return null;
                      
                      const status = results[providerId];
                      const model = provider.models.find(m => m.id === selectedModels[providerId]);
                      
                      return (
                        <div key={providerId} className="flex items-center justify-between border rounded-md p-3">
                          <div className="flex items-center gap-3">
                            {status === 'success' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <CircleSlash className="h-5 w-5 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium">{provider.name}</div>
                              {status === 'success' && model && (
                                <div className="text-sm text-gray-500">
                                  Default model: {model.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-6" />
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {step > 1 && step !== 5 && (
                <Button variant="outline" onClick={handleBack} disabled={step === 4 && isProcessing}>
                  Back
                </Button>
              )}
              
              {step < 4 && (
                <Button onClick={handleNext} className="ml-auto">
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
              
              {step === 4 && isProcessing && (
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              )}
              
              {step === 5 && (
                <Button onClick={handleFinish} className="ml-auto gap-1">
                  <Save className="h-4 w-4" />
                  Save & Finish
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                onClick={handleCancel} 
                className="ml-2"
                disabled={step === 4 && isProcessing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}