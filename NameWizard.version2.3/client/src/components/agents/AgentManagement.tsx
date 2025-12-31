import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Pause, 
  Trash, 
  Plus, 
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit,
  MoreHorizontal,
  Settings,
  FileDigit,
  FileCog,
  FileBadge,
  FileCheck,
  Activity,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Import our new AgentCreationWizard component
import AgentCreationWizard from "./AgentCreationWizard";

// Type for Agent
export type Agent = {
  id: number;
  userId: number;
  name: string;
  description: string;
  type: 'file_organizer' | 'content_analyzer' | 'batch_processor' | 'custom';
  config: Record<string, any>;
  status: 'idle' | 'running' | 'completed' | 'failed';
  lastRun: string | null;
  createdAt: string;
  updatedAt: string;
};

// Agent form schema
const agentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(['file_organizer', 'content_analyzer', 'batch_processor', 'custom'], {
    required_error: "Type is required",
  }),
  config: z.record(z.any()).optional().default({}),
});

type AgentFormData = z.infer<typeof agentFormSchema>;

// Get readable agent type
function getAgentTypeLabel(type: Agent['type']) {
  switch (type) {
    case 'file_organizer':
      return 'File Organizer';
    case 'content_analyzer':
      return 'Content Analyzer';
    case 'batch_processor':
      return 'Batch Processor';
    case 'custom':
      return 'Custom Agent';
  }
}

// Get icon for agent type
function AgentTypeIcon({ type }: { type: Agent['type'] }) {
  switch (type) {
    case 'file_organizer':
      return <FileCog className="h-5 w-5" />;
    case 'content_analyzer':
      return <FileDigit className="h-5 w-5" />;
    case 'batch_processor':
      return <FileBadge className="h-5 w-5" />;
    case 'custom':
      return <FileCheck className="h-5 w-5" />;
  }
}

// Get readable status
function getStatusLabel(status: Agent['status']) {
  switch (status) {
    case 'idle':
      return 'Idle';
    case 'running':
      return 'Running';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
  }
}

// Status badge component
function StatusBadge({ status }: { status: Agent['status'] }) {
  if (status === 'idle') {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-500/10 text-gray-500 text-xs font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-1.5"></span>
        <span>Idle</span>
      </div>
    );
  } else if (status === 'running') {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>
        <span>Running</span>
      </div>
    );
  } else if (status === 'completed') {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
        <span>Completed</span>
      </div>
    );
  } else {
    return (
      <div className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
        <span>Failed</span>
      </div>
    );
  }
}

// Agent descriptions
const agentDescriptions: Record<Agent['type'], string> = {
  'file_organizer': 'Automatically sort and organize your files into logical folders based on content and naming patterns.',
  'content_analyzer': 'Analyze file content to extract key information, summarize documents, and identify key entities.',
  'batch_processor': 'Process multiple files in a single batch with the same renaming or processing rules.',
  'custom': 'Create a custom agent with specific configuration for your unique workflow needs.',
};

// Import additional agent components
import AgentPerformanceDashboard from "./AgentPerformanceDashboard";
import AgentRecommendationEngine from "./AgentRecommendationEngine";
import DragDropAgentConfig from "./DragDropAgentConfig";
import { ContextualHelp } from "./AgentHelp";

// Main agent management component
export default function AgentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addAgentDialogOpen, setAddAgentDialogOpen] = useState(false);
  const [editAgentDialogOpen, setEditAgentDialogOpen] = useState(false);
  const [dragDropConfigOpen, setDragDropConfigOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  // UI State
  const [activeView, setActiveView] = useState<'list' | 'dashboard' | 'recommendations'>('list');
  const [showHelp, setShowHelp] = useState(true);

  // Fetch agents
  const { data: agents = [], isLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  // Agent form
  const agentForm = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "file_organizer",
      config: {},
    },
  });

  // Edit agent form
  const editAgentForm = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: selectedAgent?.name || "",
      description: selectedAgent?.description || "",
      type: selectedAgent?.type || "file_organizer",
      config: selectedAgent?.config || {},
    },
    values: {
      name: selectedAgent?.name || "",
      description: selectedAgent?.description || "",
      type: selectedAgent?.type || "file_organizer",
      config: selectedAgent?.config || {},
    },
  });

  // Add agent mutation
  const addAgentMutation = useMutation({
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
      agentForm.reset();
      setAddAgentDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to create agent",
        description: "There was an error creating your agent",
        variant: "destructive",
      });
    },
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AgentFormData }) => {
      return await apiRequest({
        url: `/api/agents/${id}`,
        method: "PATCH",
        data: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent updated",
        description: "Your agent has been updated successfully",
      });
      setEditAgentDialogOpen(false);
      setDragDropConfigOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to update agent",
        description: "There was an error updating your agent",
        variant: "destructive",
      });
    },
  });

  // Run agent mutation
  const runAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/agents/${id}/run`,
        method: "POST",
        data: { inputs: {} }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent started",
        description: "Your agent has been started successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to start agent",
        description: "There was an error starting your agent",
        variant: "destructive",
      });
    },
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest({
        url: `/api/agents/${id}`,
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent deleted",
        description: "Your agent has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete agent",
        description: "There was an error deleting your agent",
        variant: "destructive",
      });
    },
  });

  // Submit agent form
  const onSubmitAgent = (data: AgentFormData) => {
    addAgentMutation.mutate(data);
  };

  // Submit edit agent form
  const onSubmitEditAgent = (data: AgentFormData) => {
    if (selectedAgent) {
      updateAgentMutation.mutate({ id: selectedAgent.id, data });
    }
  };

  // Handle edit agent click
  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditAgentDialogOpen(true);
  };
  
  // Handle configure agent with drag-drop interface
  const handleConfigureAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setDragDropConfigOpen(true);
  };

  // Handle run agent
  const handleRunAgent = (id: number) => {
    runAgentMutation.mutate(id);
  };

  // Handle delete agent
  const handleDeleteAgent = (id: number) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      deleteAgentMutation.mutate(id);
    }
  };
  
  // Handle saving agent from drag-drop config
  const handleSaveDragDropConfig = (config: Record<string, any>) => {
    if (selectedAgent) {
      const updatedAgent: AgentFormData = {
        name: selectedAgent.name,
        description: selectedAgent.description,
        type: selectedAgent.type,
        config: config
      };
      
      updateAgentMutation.mutate({ id: selectedAgent.id, data: updatedAgent });
    }
  };
  
  // Handle creating agent from recommendation
  const handleCreateFromRecommendation = (type: Agent['type'], name: string, description: string) => {
    const newAgent: AgentFormData = {
      name,
      description,
      type,
      config: {}
    };
    
    addAgentMutation.mutate(newAgent);
  };

  return (
    <div className="space-y-6">
      {/* Header and Navigation */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">AI Agents</h2>
          <ContextualHelp topic="agent_types" />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex border rounded-lg overflow-hidden">
            <Button 
              variant={activeView === 'list' ? 'default' : 'ghost'} 
              className="h-9 rounded-none px-3"
              onClick={() => setActiveView('list')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Agents
            </Button>
            <Button 
              variant={activeView === 'dashboard' ? 'default' : 'ghost'} 
              className="h-9 rounded-none px-3"
              onClick={() => setActiveView('dashboard')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Performance
            </Button>
            <Button 
              variant={activeView === 'recommendations' ? 'default' : 'ghost'} 
              className="h-9 rounded-none px-3"
              onClick={() => setActiveView('recommendations')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Recommendations
            </Button>
          </div>
          
          <Dialog open={addAgentDialogOpen} onOpenChange={setAddAgentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] sm:h-[650px]">
              {/* Use our new AgentCreationWizard component */}
              <AgentCreationWizard 
                onClose={() => setAddAgentDialogOpen(false)}
                onSuccess={() => {
                  setAddAgentDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Help bubbles banner (conditionally shown) */}
      {showHelp && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 text-primary rounded-full">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">Contextual Help Available</h3>
                  <p className="text-xs text-muted-foreground">
                    Look for help icons throughout the interface for guidance on agent features
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8"
                onClick={() => setShowHelp(false)}
              >
                Got it
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <p>Loading agents...</p>
        </div>
      )}
      
      {/* Main content - changes based on activeView */}
      {!isLoading && (
        <>
          {/* Agents List View */}
          {activeView === 'list' && (
            <>
              {agents.length === 0 ? (
                <Card className="bg-secondary/30">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-12 w-12 mb-4 text-secondary-foreground/60" />
                    <h3 className="text-xl font-semibold mb-2">No Agents Found</h3>
                    <p className="text-center text-secondary-foreground/60 mb-6 max-w-md">
                      You haven't created any AI agents yet. Create your first agent to automate file processing tasks.
                    </p>
                    <Button onClick={() => setAddAgentDialogOpen(true)}>
                      Create Your First Agent
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                              <AgentTypeIcon type={agent.type} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{agent.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{getAgentTypeLabel(agent.type)}</Badge>
                                <StatusBadge status={agent.status} />
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Basic Info
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleConfigureAgent(agent)}>
                                <Settings className="mr-2 h-4 w-4" /> Advanced Config
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRunAgent(agent.id)}>
                                <Play className="mr-2 h-4 w-4" /> Run Agent
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDeleteAgent(agent.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{agent.description}</p>
                        
                        {agent.lastRun && (
                          <div className="text-xs text-gray-500 mb-3">
                            Last run: {new Date(agent.lastRun).toLocaleString()}
                          </div>
                        )}
                        
                        {agent.status === 'completed' && (agent.config as any)?.results && (
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="results">
                              <AccordionTrigger className="text-xs py-2">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                                  View Results
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <pre className="text-xs bg-secondary/30 p-2 rounded-md overflow-x-auto">
                                  {JSON.stringify((agent.config as any).results, null, 2)}
                                </pre>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                        
                        {agent.status === 'failed' && (
                          <div className="flex items-center gap-2 text-xs text-red-500 mt-2">
                            <AlertCircle className="h-3 w-3" />
                            <span>Failed to complete. Try running again.</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigureAgent(agent)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        
                        <Button
                          size="sm"
                          disabled={agent.status === 'running' || runAgentMutation.isPending}
                          onClick={() => handleRunAgent(agent.id)}
                        >
                          {agent.status === 'running' ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Run Agent
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Performance Dashboard View */}
          {activeView === 'dashboard' && <AgentPerformanceDashboard />}
          
          {/* AI Recommendations View */}
          {activeView === 'recommendations' && (
            <AgentRecommendationEngine onCreateRecommendedAgent={handleCreateFromRecommendation} />
          )}
        </>
      )}
      
      {/* Drag and Drop Configuration Dialog */}
      <Dialog 
        open={dragDropConfigOpen} 
        onOpenChange={setDragDropConfigOpen}
        modal={true}
      >
        <DialogContent className="max-w-6xl h-[80vh] p-6">
          {selectedAgent && (
            <DragDropAgentConfig
              agent={selectedAgent}
              onSave={handleSaveDragDropConfig}
              onCancel={() => setDragDropConfigOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Agent Dialog */}
      <Dialog open={editAgentDialogOpen} onOpenChange={setEditAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update your AI agent configuration
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <Form {...editAgentForm}>
              <form onSubmit={editAgentForm.handleSubmit(onSubmitEditAgent)} className="space-y-4">
                <FormField
                  control={editAgentForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editAgentForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={updateAgentMutation.isPending}
                  >
                    {updateAgentMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}