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
import { 
  Bot, 
  Play, 
  Edit2, 
  Trash2,
  Settings,
  Calendar,
  Plus,
  FileUp,
  ListChecks,
  Tag,
  MessageSquareText,
  Bot as BotIcon,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: number;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive';
  lastRun?: string;
  triggers: Array<'schedule' | 'upload' | 'manual' | 'tag'>;
  actions: Array<'rename' | 'tag' | 'organize' | 'process' | 'notify'>;
  model: string;
}

const AgentsSection: React.FC = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 1,
      name: 'Invoice Processor',
      description: 'Automatically rename and organize invoice files',
      type: 'file-processor',
      status: 'active',
      lastRun: '2025-04-15T13:20:00Z',
      triggers: ['upload', 'schedule'],
      actions: ['rename', 'organize'],
      model: 'gpt_4o'
    },
    {
      id: 2,
      name: 'Image Tagger',
      description: 'Add descriptive tags to image files based on content',
      type: 'content-analyzer',
      status: 'active',
      lastRun: '2025-04-16T09:15:30Z',
      triggers: ['upload', 'manual'],
      actions: ['tag'],
      model: 'llama_3_2_90b'
    },
    {
      id: 3,
      name: 'Document Organizer',
      description: 'Sort and organize documents into appropriate folders',
      type: 'organizer',
      status: 'inactive',
      lastRun: '2025-04-10T14:25:45Z',
      triggers: ['manual'],
      actions: ['organize', 'tag'],
      model: 'claude_3_5_sonnet'
    },
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
    // In a real app, this would call an API to run the agent
    
    toast({
      title: "Agent triggered",
      description: "Agent has been triggered to run",
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
      triggers: formData.triggers,
      actions: formData.actions,
      model: formData.model
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
  
  const getAgentTypeIcon = (type: string) => {
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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold mb-1">AI Agents</h2>
          <p className="text-zinc-400 text-sm">Configure AI agents for automated tasks</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Configure an AI agent to automate file management tasks.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Invoice Processor"
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  name="description" 
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What this agent does..."
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Agent Type</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file-processor">File Processor</SelectItem>
                    <SelectItem value="content-analyzer">Content Analyzer</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="model">AI Model</Label>
                <Select value={formData.model} onValueChange={handleModelChange}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Select AI Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt_4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt_4o_mini">GPT-4o mini</SelectItem>
                    <SelectItem value="claude_3_5_sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="llama_3_2_90b">Llama 3.2 90B</SelectItem>
                    <SelectItem value="llama_3_70b">Llama 3 70B</SelectItem>
                    <SelectItem value="gemini_1_5_pro">Gemini 1.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block mb-2">Triggers</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className={`p-2 rounded border ${
                      formData.triggers.includes('schedule') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleTriggerToggle('schedule')}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule</span>
                  </div>
                  <div 
                    className={`p-2 rounded border ${
                      formData.triggers.includes('upload') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleTriggerToggle('upload')}
                  >
                    <FileUp className="w-4 h-4" />
                    <span>On Upload</span>
                  </div>
                  <div 
                    className={`p-2 rounded border ${
                      formData.triggers.includes('manual') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleTriggerToggle('manual')}
                  >
                    <Play className="w-4 h-4" />
                    <span>Manual</span>
                  </div>
                  <div 
                    className={`p-2 rounded border ${
                      formData.triggers.includes('tag') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleTriggerToggle('tag')}
                  >
                    <Tag className="w-4 h-4" />
                    <span>By Tag</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="block mb-2">Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className={`p-2 rounded border ${
                      formData.actions.includes('rename') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleActionToggle('rename')}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Rename</span>
                  </div>
                  <div 
                    className={`p-2 rounded border ${
                      formData.actions.includes('tag') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleActionToggle('tag')}
                  >
                    <Tag className="w-4 h-4" />
                    <span>Tag</span>
                  </div>
                  <div 
                    className={`p-2 rounded border ${
                      formData.actions.includes('organize') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleActionToggle('organize')}
                  >
                    <ListChecks className="w-4 h-4" />
                    <span>Organize</span>
                  </div>
                  <div 
                    className={`p-2 rounded border ${
                      formData.actions.includes('process') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleActionToggle('process')}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Process</span>
                  </div>
                  <div 
                    className={`p-2 rounded border ${
                      formData.actions.includes('notify') 
                        ? 'bg-orange-950 border-orange-700' 
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
                    } flex items-center gap-2 cursor-pointer`}
                    onClick={() => handleActionToggle('notify')}
                  >
                    <MessageSquareText className="w-4 h-4" />
                    <span>Notify</span>
                  </div>
                </div>
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
                Create Agent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {agents.map(agent => (
          <div key={agent.id} className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-950 text-orange-500">
                    <BotIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center">
                      {agent.name}
                      {agent.status === 'active' && (
                        <div className="ml-2 flex items-center text-xs">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                          <span className="text-green-500">Active</span>
                        </div>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center text-xs text-zinc-400">
                        {getAgentTypeIcon(agent.type)}
                        <span className="ml-1">{agent.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      </span>
                      <span className="text-zinc-500 text-xs">|</span>
                      <span className="flex items-center text-xs text-zinc-400">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {agent.model.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ').replace(/([0-9]+[a-z])/i, (match) => match.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-zinc-400 text-sm mb-3 mt-2">{agent.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="text-xs font-medium p-1 rounded bg-zinc-800 text-zinc-300">
                    Triggers:
                  </div>
                  {agent.triggers.map(trigger => (
                    <div key={trigger} className="flex items-center gap-1 text-xs rounded-full bg-zinc-900 border border-zinc-700 px-2 py-0.5">
                      {getTriggerIcon(trigger)}
                      <span>{trigger.charAt(0).toUpperCase() + trigger.slice(1)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs font-medium p-1 rounded bg-zinc-800 text-zinc-300">
                    Actions:
                  </div>
                  {agent.actions.map(action => (
                    <div key={action} className="flex items-center gap-1 text-xs rounded-full bg-zinc-900 border border-zinc-700 px-2 py-0.5">
                      {getActionIcon(action)}
                      <span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
                    </div>
                  ))}
                </div>
                
                {agent.lastRun && (
                  <div className="mt-3 text-xs text-zinc-500">
                    Last run: {new Date(agent.lastRun).toLocaleString()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleStatus(agent.id)}
                  className={`${
                    agent.status === 'active' 
                      ? 'border-green-800 text-green-500 hover:bg-green-950'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {agent.status === 'active' ? 'Disable' : 'Enable'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runAgent(agent.id)}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <Play className="w-3 h-3 mr-2" />
                  Run Now
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
                        This will permanently delete this agent and all associated data.
                        This action cannot be undone.
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
              </div>
            </div>
          </div>
        ))}
        
        {agents.length === 0 && (
          <div className="bg-zinc-950 rounded-lg p-8 border border-zinc-800 text-center">
            <Bot className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <h3 className="text-xl font-medium mb-2">No Agents</h3>
            <p className="text-zinc-400 mb-4">
              You haven't created any AI agents yet. Create an agent to automate file management tasks.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Agent
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsSection;