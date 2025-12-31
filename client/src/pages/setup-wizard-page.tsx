import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ApiKeyManager from '@/components/api-keys/ApiKeyManager';
import { CheckCircle, PlayCircle, ArrowLeft, Zap, Settings, Server, FileText } from 'lucide-react';


export default function SetupWizardPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState('api-keys');
  
  const steps = [
    { id: 'api-keys', name: 'API Keys', icon: <Settings className="w-5 h-5 text-orange-500" /> },
    { id: 'connections', name: 'Storage Connections', icon: <Server className="w-5 h-5 text-blue-500" /> },
    { id: 'preferences', name: 'Preferences', icon: <FileText className="w-5 h-5 text-green-500" /> },
  ];
  
  const handleStepChange = (stepId: string) => {
    setActiveStep(stepId);
  };
  
  const handleFinish = () => {
    toast({
      title: 'Setup complete',
      description: 'Your application has been configured successfully.',
    });
    
    setLocation('/');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Setup Wizard</h1>
        </div>
        
        <Button onClick={handleFinish}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Finish Setup
        </Button>
      </div>
      
      {/* Steps Navigation */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <Button
                variant={activeStep === step.id ? "default" : "outline"}
                className={`rounded-full px-4 py-6 ${
                  activeStep === step.id 
                    ? "bg-orange-600 hover:bg-orange-700 text-white" 
                    : "border-orange-200 text-orange-800 hover:bg-orange-50"
                }`}
                onClick={() => handleStepChange(step.id)}
              >
                <div className="flex flex-col items-center">
                  {step.icon}
                  <span className="mt-1">{step.name}</span>
                </div>
              </Button>
              
              {index < steps.length - 1 && (
                <div className="w-24 h-px bg-gray-200" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeStep === 'api-keys' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Set Up Your AI Provider API Keys</h2>
              <p className="text-gray-600">
                Connect to your preferred AI providers by adding your API keys. These keys will be used
                to make requests to the AI models for file naming suggestions.
              </p>
            </div>
            
            <ApiKeyManager autoOpenIntegrationWizard={true} />
          </div>
        )}
        
        {activeStep === 'connections' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Connect to Storage Providers</h2>
              <p className="text-gray-600">
                Link your cloud storage accounts to easily import and export files.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dropbox</CardTitle>
                  <CardDescription>
                    Connect to your Dropbox account for file sync
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Dropbox connection form would go here */}
                  <div className="py-8 flex justify-center">
                    <Button variant="outline" className="w-full">
                      Connect to Dropbox
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Google Drive</CardTitle>
                  <CardDescription>
                    Connect to your Google Drive account for file sync
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Google Drive connection form would go here */}
                  <div className="py-8 flex justify-center">
                    <Button variant="outline" className="w-full">
                      Connect to Google Drive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        
        {activeStep === 'preferences' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Customize Your Experience</h2>
              <p className="text-gray-600">
                Set your preferences for the application's behavior.
              </p>
            </div>
            
            <div className="py-12 text-center text-gray-500">
              <p>Preferences section will be implemented in a future update.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {activeStep !== steps[0].id && (
          <Button 
            variant="outline"
            onClick={() => {
              const currentIndex = steps.findIndex(step => step.id === activeStep);
              if (currentIndex > 0) {
                handleStepChange(steps[currentIndex - 1].id);
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
        )}
        
        {activeStep !== steps[steps.length - 1].id && (
          <Button 
            className="ml-auto"
            onClick={() => {
              const currentIndex = steps.findIndex(step => step.id === activeStep);
              if (currentIndex < steps.length - 1) {
                handleStepChange(steps[currentIndex + 1].id);
              }
            }}
          >
            Next
            <PlayCircle className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {activeStep === steps[steps.length - 1].id && (
          <Button 
            className="ml-auto bg-green-600 hover:bg-green-700" 
            onClick={handleFinish}
          >
            Complete Setup
            <CheckCircle className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}