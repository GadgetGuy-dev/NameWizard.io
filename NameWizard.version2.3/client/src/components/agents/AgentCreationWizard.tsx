import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileCheck, 
  FileCog, 
  FileDigit, 
  FileBadge,
  Settings,
  PlayCircle,
  Folder,
  File
} from "lucide-react";

// Types
import type { Agent } from "./AgentManagement";

// Wizard steps
enum WizardStep {
  SelectType = 0,
  ConfigureBasic = 1,
  ConfigureAdvanced = 2,
  Review = 3,
}

// Agent types with descriptions
const agentTypes = [
  {
    id: 'file_organizer',
    name: 'File Organizer',
    description: 'Automatically sort and organize your files into logical folders based on content and naming patterns.',
    icon: FileCog,
    configOptions: ['target_directory', 'include_subfolders', 'create_missing_folders', 'organize_by_type', 'organize_by_content']
  },
  {
    id: 'content_analyzer',
    name: 'Content Analyzer',
    description: 'Analyze file content to extract key information, summarize documents, and identify key entities.',
    icon: FileDigit,
    configOptions: ['analyze_text', 'extract_entities', 'summarize_content', 'detect_language', 'sentiment_analysis']
  },
  {
    id: 'batch_processor',
    name: 'Batch Processor',
    description: 'Process multiple files in a single batch with the same renaming or processing rules.',
    icon: FileBadge,
    configOptions: ['source_directory', 'target_directory', 'file_pattern', 'process_recursively', 'preserve_structure']
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Create a custom agent with specific configuration for your unique workflow needs.',
    icon: FileCheck,
    configOptions: ['custom_action', 'triggers', 'schedule', 'notification']
  }
];

// Form schema
const agentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(['file_organizer', 'content_analyzer', 'batch_processor', 'custom'], {
    required_error: "Agent type is required",
  }),
  config: z.record(z.any()).optional().default({}),
});

// Form data type
type AgentFormData = z.infer<typeof agentFormSchema>;

// Component props
interface AgentCreationWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AgentCreationWizard({ onClose, onSuccess }: AgentCreationWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.SelectType);
  const [selectedAgentType, setSelectedAgentType] = useState<string | null>(null);
  const [featuresEnabled, setFeaturesEnabled] = useState<Record<string, boolean>>({});
  
  // Form handling
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "file_organizer",
      config: {},
    },
  });
  
  // When agent type changes, update the form value
  useEffect(() => {
    if (selectedAgentType) {
      form.setValue('type', selectedAgentType as any);
      
      // Initialize feature toggles
      const agentType = agentTypes.find(type => type.id === selectedAgentType);
      if (agentType) {
        const features = agentType.configOptions.reduce((acc, option) => {
          acc[option] = true;
          return acc;
        }, {} as Record<string, boolean>);
        
        setFeaturesEnabled(features);
      }
    }
  }, [selectedAgentType, form]);
  
  // When features change, update the config
  useEffect(() => {
    form.setValue('config', featuresEnabled);
  }, [featuresEnabled, form]);
  
  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (data: AgentFormData) => {
      return await apiRequest({
        url: "/api/agents",
        method: "POST",
        data: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent created",
        description: "Your agent has been created successfully",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to create agent",
        description: "There was an error creating your agent",
        variant: "destructive",
      });
    },
  });
  
  // Step navigation
  const nextStep = () => {
    // Validate the current step before proceeding
    if (currentStep === WizardStep.SelectType && !selectedAgentType) {
      toast({
        title: "Select an agent type",
        description: "Please select an agent type to continue",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === WizardStep.ConfigureBasic) {
      const { name, description } = form.getValues();
      if (!name || !description) {
        form.trigger(['name', 'description']);
        return;
      }
    }
    
    if (currentStep < WizardStep.Review) {
      setCurrentStep(prev => (prev + 1) as WizardStep);
    }
  };
  
  const prevStep = () => {
    if (currentStep > WizardStep.SelectType) {
      setCurrentStep(prev => (prev - 1) as WizardStep);
    }
  };
  
  // Handle feature toggle
  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    setFeaturesEnabled(prev => ({
      ...prev,
      [feature]: enabled
    }));
  };
  
  // Submit form
  const onSubmit = (data: AgentFormData) => {
    // Combine the form data with the feature configuration
    const agentData = {
      ...data,
      config: featuresEnabled
    };
    
    createAgentMutation.mutate(agentData);
  };
  
  // Get current agent type details
  const currentAgentType = agentTypes.find(type => type.id === selectedAgentType);
  
  // Get wizard step label
  const getStepLabel = (step: WizardStep) => {
    switch (step) {
      case WizardStep.SelectType:
        return "Select Agent Type";
      case WizardStep.ConfigureBasic:
        return "Basic Configuration";
      case WizardStep.ConfigureAdvanced:
        return "Advanced Settings";
      case WizardStep.Review:
        return "Review & Create";
    }
  };
  
  // Format feature label
  const formatFeatureLabel = (feature: string) => {
    return feature
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Wizard UI - Select Type Step
  const renderSelectTypeStep = () => {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Choose the type of agent you want to create. Each agent type is specialized for specific file processing tasks.
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          {agentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all ${selectedAgentType === type.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                onClick={() => setSelectedAgentType(type.id)}
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <div className={`p-2 rounded-lg ${selectedAgentType === type.id ? 'bg-primary text-white' : 'bg-secondary'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  {selectedAgentType === type.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Wizard UI - Configure Basic Step
  const renderConfigureBasicStep = () => {
    if (!currentAgentType) return null;
    const Icon = currentAgentType.icon;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4 py-3 bg-secondary rounded-lg">
          <div className="p-2 rounded-lg bg-primary text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium">{currentAgentType.name}</h3>
            <p className="text-xs text-muted-foreground">{currentAgentType.description}</p>
          </div>
        </div>
        
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder={`My ${currentAgentType.name}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this agent will do"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    );
  };
  
  // Wizard UI - Configure Advanced Step
  const renderConfigureAdvancedStep = () => {
    if (!currentAgentType) return null;
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Configure which features you want to enable for your {currentAgentType.name} agent.
        </p>
        
        <div className="grid gap-4 mt-4">
          {currentAgentType.configOptions.map((feature) => (
            <div key={feature} className="flex items-center justify-between py-2 border-b">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">{formatFeatureLabel(feature)}</div>
                <div className="text-xs text-muted-foreground">
                  {getFeatureDescription(currentAgentType.id, feature)}
                </div>
              </div>
              <Switch
                checked={featuresEnabled[feature] || false}
                onCheckedChange={(checked) => handleFeatureToggle(feature, checked)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Wizard UI - Review Step
  const renderReviewStep = () => {
    if (!currentAgentType) return null;
    const Icon = currentAgentType.icon;
    const formData = form.getValues();
    
    return (
      <div className="space-y-6">
        <div className="px-5 py-4 bg-secondary rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Agent Summary</h3>
          
          <div className="flex items-start gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary text-white">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-base">{formData.name}</h4>
              <div className="text-sm text-muted-foreground mt-0.5">{currentAgentType.name}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h5 className="text-sm font-medium mb-1">Description</h5>
              <p className="text-sm text-muted-foreground">{formData.description}</p>
            </div>
            
            <Separator className="my-3" />
            
            <div>
              <h5 className="text-sm font-medium mb-2">Enabled Features</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(featuresEnabled)
                  .filter(([_, enabled]) => enabled)
                  .map(([feature]) => (
                    <div 
                      key={feature} 
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{formatFeatureLabel(feature)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <PlayCircle className="text-primary h-5 w-5" />
            <div className="font-medium">What happens next?</div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            After creating your agent, you can run it from your Agents dashboard. 
            The agent will process files according to your configuration and report results.
          </p>
        </div>
      </div>
    );
  };
  
  // Get step content based on current step
  const getStepContent = () => {
    switch (currentStep) {
      case WizardStep.SelectType:
        return renderSelectTypeStep();
      case WizardStep.ConfigureBasic:
        return renderConfigureBasicStep();
      case WizardStep.ConfigureAdvanced:
        return renderConfigureAdvancedStep();
      case WizardStep.Review:
        return renderReviewStep();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with step indicator */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Agent</h2>
        
        <div className="flex items-center gap-1 mb-6">
          {Object.values(WizardStep)
            .filter(step => typeof step === 'number')
            .map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                  ${Number(currentStep) >= Number(step) 
                    ? 'bg-primary text-white' 
                    : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {Number(step) + 1}
                </div>
                {Number(step) < 3 && (
                  <div className={`h-1 w-12 ${Number(currentStep) > Number(step) ? 'bg-primary' : 'bg-secondary'}`} />
                )}
              </div>
            ))}
        </div>
        
        <h3 className="text-lg font-medium">{getStepLabel(currentStep)}</h3>
        <Separator className="mt-3" />
      </div>
      
      {/* Step content */}
      <div className="flex-1 overflow-y-auto pb-4">
        {getStepContent()}
      </div>
      
      {/* Footer with navigation buttons */}
      <div className="flex justify-between items-center pt-4 mt-auto border-t">
        <div>
          {currentStep > WizardStep.SelectType && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {currentStep < WizardStep.Review ? (
            <Button onClick={nextStep} className="flex items-center">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={createAgentMutation.isPending}
            >
              {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get feature descriptions
function getFeatureDescription(agentType: string, feature: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    file_organizer: {
      target_directory: 'Specify the directory where files will be organized',
      include_subfolders: 'Process files in subdirectories recursively',
      create_missing_folders: 'Create folders that don\'t exist yet',
      organize_by_type: 'Group files by their type/extension',
      organize_by_content: 'Use AI to analyze content and determine appropriate folders'
    },
    content_analyzer: {
      analyze_text: 'Extract and analyze textual content from files',
      extract_entities: 'Identify key entities like names, dates, locations, etc.',
      summarize_content: 'Generate concise summaries of document content',
      detect_language: 'Automatically detect the language of the content',
      sentiment_analysis: 'Determine the emotional tone of the content'
    },
    batch_processor: {
      source_directory: 'Directory containing files to process',
      target_directory: 'Directory where processed files will be saved',
      file_pattern: 'Pattern to match specific files (e.g., *.pdf)',
      process_recursively: 'Process files in all subdirectories',
      preserve_structure: 'Maintain the original folder structure in the output'
    },
    custom: {
      custom_action: 'Define custom processing actions',
      triggers: 'Set conditions that will activate the agent',
      schedule: 'Set up automatic scheduled runs',
      notification: 'Receive notifications when processing completes'
    }
  };
  
  return descriptions[agentType]?.[feature] || 'Configure this feature for your agent';
}