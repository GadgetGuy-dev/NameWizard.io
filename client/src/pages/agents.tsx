import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { 
  Bot, 
  PlusCircle, 
  MoreHorizontal, 
  Play, 
  Edit2, 
  Trash2,
  FileUp,
  ListChecks,
  Tag,
  MessageSquareText,
  Settings,
  Calendar,
  Info,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface Agent {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  llmType: string;
  lastRun?: string | null;
  type?: string;
  triggers?: Array<'schedule' | 'upload' | 'manual' | 'tag'>;
  actions?: Array<'rename' | 'tag' | 'organize' | 'process' | 'notify'>;
  model?: string;
}

const AgentsPage: React.FC = () => {
  const { toast } = useToast();
  const [showLocationNotice, setShowLocationNotice] = useState(true);
  
  // Check if it's the user's first visit after the change
  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('agents_location_notice');
    if (hasSeenNotice) {
      setShowLocationNotice(false);
    }
  }, []);
  
  const dismissNotice = () => {
    localStorage.setItem('agents_location_notice', 'true');
    setShowLocationNotice(false);
  };
  
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      name: "File Renamer",
      description: "Automatically rename files based on content analysis",
      status: "active",
      type: "file-processor",
      llmType: "claude_3_5_sonnet",
      lastRun: "2025-04-14T10:30:00Z",
      triggers: ['upload', 'schedule'],
      actions: ['rename', 'organize']
    },
    {
      id: 2,
      name: "Metadata Extractor",
      description: "Extract metadata from files for better organization",
      status: "active",
      type: "content-analyzer",
      llmType: "gpt_4o",
      lastRun: "2025-04-15T14:45:00Z",
      triggers: ['upload', 'manual'],
      actions: ['tag']
    },
    {
      id: 3,
      name: "Duplicate Detector",
      description: "Find and manage duplicate files in your storage",
      status: "active",
      type: "organizer",
      llmType: "claude_3_5_sonnet",
      lastRun: "2025-04-21T18:30:21Z",
      triggers: ['manual'],
      actions: ['organize', 'tag']
    }
  ]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'file-processor',
    triggers: [] as Array<'schedule' | 'upload' | 'manual' | 'tag'>,
    actions: [] as Array<'rename' | 'tag' | 'organize' | 'process' | 'notify'>,
    model: 'gpt_4o'
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Handler functions from the previous AgentsSection
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
  };
  
  const handleModelChange = (value: string) => {
    setFormData(prev => ({ ...prev, model: value }));
  };
  
  const handleTriggerToggle = (trigger: 'schedule' | 'upload' | 'manual' | 'tag') => {
    setFormData(prev => {
      if (prev.triggers.includes(trigger)) {
        return {
          ...prev,
          triggers: prev.triggers.filter(t => t !== trigger)
        };
      } else {
        return {
          ...prev,
          triggers: [...prev.triggers, trigger]
        };
      }
    });
  };
  
  const handleActionToggle = (action: 'rename' | 'tag' | 'organize' | 'process' | 'notify') => {
    setFormData(prev => {
      if (prev.actions.includes(action)) {
        return {
          ...prev,
          actions: prev.actions.filter(a => a !== action)
        };
      } else {
        return {
          ...prev,
          actions: [...prev.actions, action]
        };
      }
    });
  };
  
  const toggleStatus = (id: number) => {
    setAgents(agents => agents.map(agent => {
      if (agent.id === id) {
        const newStatus = agent.status === 'active' ? 'inactive' : 'active';
        return { ...agent, status: newStatus };
      }
      return agent;
    }));
    
    toast({
      title: "Agent status updated",
      description: "Agent status has been updated",
      variant: "default",
    });
  };
  
  const runAgent = (id: number) => {
    // Find the agent to get its name
    const agent = agents.find(a => a.id === id);
    
    // Update the lastRun time for the agent
    setAgents(agents => agents.map(a => {
      if (a.id === id) {
        return { ...a, lastRun: new Date().toISOString() };
      }
      return a;
    }));
    
    // In a real app, this would call an API to run the agent
    toast({
      title: `${agent?.name} is running`,
      description: "Agent has been triggered and is now processing files",
      variant: "default",
    });
  };
  
  const deleteAgent = (id: number) => {
    setAgents(agents => agents.filter(agent => agent.id !== id));
    
    toast({
      title: "Agent deleted",
      description: "Agent has been deleted",
      variant: "default",
    });
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.description || formData.triggers.length === 0 || formData.actions.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Add new agent
    const newAgent = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      status: 'inactive' as const,
      llmType: formData.model,
      triggers: formData.triggers,
      actions: formData.actions
    };
    
    setAgents(prev => [...prev, newAgent]);
    setFormData({
      name: '',
      description: '',
      type: 'file-processor',
      triggers: [],
      actions: [],
      model: 'gpt_4o'
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Agent created",
      description: "New agent has been created",
      variant: "default",
    });
  };
  
  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      type: agent.type || 'file-processor',
      triggers: agent.triggers || [],
      actions: agent.actions || [],
      model: agent.llmType || 'gpt_4o'
    });
    setIsDialogOpen(true);
  };
  
  const getAgentTypeIcon = (type: string = 'file-processor') => {
    switch (type) {
      case 'file-processor':
        return <FileUp className="w-4 h-4" />;
      case 'content-analyzer':
        return <Bot className="w-4 h-4" />;
      case 'organizer':
        return <ListChecks className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };
  
  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'schedule':
        return <Calendar className="w-4 h-4" />;
      case 'upload':
        return <FileUp className="w-4 h-4" />;
      case 'manual':
        return <Play className="w-4 h-4" />;
      case 'tag':
        return <Tag className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'rename':
        return <Edit2 className="w-4 h-4" />;
      case 'tag':
        return <Tag className="w-4 h-4" />;
      case 'organize':
        return <ListChecks className="w-4 h-4" />;
      case 'process':
        return <Settings className="w-4 h-4" />;
      case 'notify':
        return <MessageSquareText className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
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
                <p className="text-orange-200 text-sm">AI Agents have been moved from the Settings page to this dedicated page for easier access. All functionality is now available here.</p>
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
      
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">AI Agents</h1>
              <p className="text-gray-300">
                Manage your automated AI assistants
              </p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white mb-1">
                <FileUp className="text-orange-500 h-4 w-4" />
                <h3 className="font-medium">File Renamer</h3>
              </div>
              <p className="text-xs text-gray-400">
                AI-powered agent that analyzes file content and applies intelligent naming conventions based on detected patterns and content.
              </p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white mb-1">
                <Bot className="text-orange-500 h-4 w-4" />
                <h3 className="font-medium">Metadata Extractor</h3>
              </div>
              <p className="text-xs text-gray-400">
                Processes files to automatically extract and tag metadata such as dates, people, locations, and other entities for better searchability.
              </p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-white mb-1">
                <ListChecks className="text-orange-500 h-4 w-4" />
                <h3 className="font-medium">Duplicate Detector</h3>
              </div>
              <p className="text-xs text-gray-400">
                Identifies potential duplicate files using content analysis, checksums, and fuzzy matching, helping to clean up your file storage.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">My Agents</h2>
            <p className="text-gray-300 text-sm">
              Your configured AI assistants
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white font-medium">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-xl text-white">
                  {editingAgent ? 'Edit Agent' : 'Create New Agent'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingAgent 
                    ? 'Update the agent properties to change its behavior.' 
                    : 'Define a new agent to automate file management tasks.'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Agent Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="My File Renamer Agent" 
                    className="border-zinc-800 bg-zinc-950 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Input 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Automatically rename files based on content"
                    className="border-zinc-800 bg-zinc-950 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-300">Agent Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={handleTypeChange}
                  >
                    <SelectTrigger className="border-zinc-800 bg-zinc-950 text-white">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-900 text-white">
                      <SelectItem value="file-processor">File Processor</SelectItem>
                      <SelectItem value="content-analyzer">Content Analyzer</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-gray-300">AI Model</Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger className="border-zinc-800 bg-zinc-950 text-white">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-800 bg-zinc-900 text-white">
                      <SelectItem value="gpt_4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt_4o_mini">GPT-4o mini</SelectItem>
                      <SelectItem value="claude_3_5_sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="llama_3_70b">Llama 3 70B</SelectItem>
                      <SelectItem value="llama_3_2_90b">Llama 3.2 90B</SelectItem>
                      <SelectItem value="gemini_1_5_pro">Gemini 1.5 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Triggers</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['schedule', 'upload', 'manual', 'tag'] as const).map((trigger) => (
                      <Button
                        key={trigger}
                        type="button"
                        variant={formData.triggers.includes(trigger) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTriggerToggle(trigger)}
                        className={formData.triggers.includes(trigger) 
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'border-zinc-700 text-zinc-300 hover:text-white'}
                      >
                        {getTriggerIcon(trigger)}
                        <span className="ml-1 capitalize">{trigger}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Actions</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['rename', 'tag', 'organize', 'process', 'notify'] as const).map((action) => (
                      <Button
                        key={action}
                        type="button"
                        variant={formData.actions.includes(action) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleActionToggle(action)}
                        className={formData.actions.includes(action) 
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'border-zinc-700 text-zinc-300 hover:text-white'}
                      >
                        {getActionIcon(action)}
                        <span className="ml-1 capitalize">{action}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="border-zinc-700 text-zinc-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="border border-zinc-800 bg-zinc-950">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium text-white">{agent.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(agent)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => runAgent(agent.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Run Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(agent.id)}>
                        {agent.status === 'active' ? (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Disable Agent
                          </>
                        ) : (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Enable Agent
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Agent
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This agent will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteAgent(agent.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="text-gray-400">{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className={agent.status === 'active' ? 'bg-green-500 text-white font-medium' : 'bg-zinc-600 text-gray-200 font-medium'}>
                    {agent.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-700">{agent.llmType.replace('_', ' ').toUpperCase()}</Badge>
                  {agent.type && (
                    <Badge variant="outline" className="bg-zinc-800 text-orange-400 border-zinc-700 flex items-center gap-1">
                      {getAgentTypeIcon(agent.type)}
                      <span>{agent.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                    </Badge>
                  )}
                </div>
                
                {agent.triggers && agent.triggers.length > 0 && (
                  <div>
                    <div className="text-xs uppercase text-zinc-500 mb-1">Triggers</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.triggers.map((trigger, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs py-1 px-2 bg-zinc-800 text-zinc-300 rounded-md">
                          {getTriggerIcon(trigger)}
                          <span>{trigger.charAt(0).toUpperCase() + trigger.slice(1)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {agent.actions && agent.actions.length > 0 && (
                  <div>
                    <div className="text-xs uppercase text-zinc-500 mb-1">Actions</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.actions.map((action, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-xs py-1 px-2 bg-zinc-800 text-zinc-300 rounded-md">
                          {getActionIcon(action)}
                          <span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-xs text-gray-400 font-medium border-t border-zinc-800 flex justify-between">
                <span>{agent.lastRun ? `Last run: ${new Date(agent.lastRun).toLocaleString()}` : 'Never run'}</span>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white h-6 px-2"
                  onClick={() => runAgent(agent.id)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AgentsPage;