import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { 
  FileDigit, 
  FileCog, 
  FileBadge, 
  FileCheck, 
  GripVertical, 
  Plus,
  X,
  RefreshCw,
  Save,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Filter,
  SlidersHorizontal,
  Workflow
} from "lucide-react";

// Import contextual help component
import { ContextualHelp, FeatureHelp } from "./AgentHelp";

// Type imports
import type { Agent } from "./AgentManagement";

// Interface for a configuration block
interface ConfigBlock {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: JSX.Element;
  config: Record<string, any>;
  enabled: boolean;
}

// Available block types
const blockTypes = {
  'input': {
    title: 'Input Source',
    description: 'Define where files will be sourced from',
    icon: <FolderOpen className="h-5 w-5" />
  },
  'filter': {
    title: 'File Filter',
    description: 'Specify which files to include or exclude',
    icon: <Filter className="h-5 w-5" />
  },
  'process': {
    title: 'Processing Step',
    description: 'Define actions to perform on each file',
    icon: <SlidersHorizontal className="h-5 w-5" />
  },
  'output': {
    title: 'Output Destination',
    description: 'Configure where processed files will be stored',
    icon: <FileCheck className="h-5 w-5" />
  },
  'workflow': {
    title: 'Workflow Rule',
    description: 'Set conditions for when this agent should run',
    icon: <Workflow className="h-5 w-5" />
  }
};

// Function to get a new block ID
const getNewId = () => `block-${Date.now()}`;

// DragDropAgentConfig component props
interface DragDropAgentConfigProps {
  agent?: Agent;
  onSave: (config: Record<string, any>) => void;
  onCancel: () => void;
}

// Component to render a draggable configuration block
function DraggableConfigBlock({
  block,
  index,
  onUpdate,
  onRemove
}: {
  block: ConfigBlock;
  index: number;
  onUpdate: (id: string, config: Record<string, any>, enabled: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Update block enabled state
  const toggleEnabled = () => {
    onUpdate(block.id, block.config, !block.enabled);
  };
  
  // Update block configuration
  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...block.config, [key]: value };
    onUpdate(block.id, newConfig, block.enabled);
  };
  
  // Render config inputs based on block type
  const renderConfigOptions = () => {
    switch (block.type) {
      case 'input':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor={`${block.id}-source`} className="text-xs">Source Type</Label>
                <Select 
                  value={block.config.sourceType || 'folder'} 
                  onValueChange={(value) => updateConfig('sourceType', value)}
                >
                  <SelectTrigger id={`${block.id}-source`}>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="folder">Local Folder</SelectItem>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                    <SelectItem value="google-drive">Google Drive</SelectItem>
                    <SelectItem value="upload">Manual Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {block.config.sourceType === 'folder' && (
                <div>
                  <Label htmlFor={`${block.id}-path`} className="text-xs">Folder Path</Label>
                  <Input 
                    id={`${block.id}-path`}
                    value={block.config.path || ''} 
                    onChange={(e) => updateConfig('path', e.target.value)}
                    placeholder="/path/to/folder"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${block.id}-recursive`} 
                checked={block.config.recursive || false}
                onCheckedChange={(checked) => updateConfig('recursive', checked)}
              />
              <label
                htmlFor={`${block.id}-recursive`}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include subfolders
              </label>
            </div>
          </div>
        );
        
      case 'filter':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`${block.id}-pattern`} className="text-xs">File Pattern</Label>
              <Input 
                id={`${block.id}-pattern`}
                value={block.config.pattern || ''} 
                onChange={(e) => updateConfig('pattern', e.target.value)}
                placeholder="*.pdf,*.docx"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated patterns to include (e.g., *.pdf,*.docx)
              </p>
            </div>
            
            <div>
              <Label htmlFor={`${block.id}-exclude`} className="text-xs">Exclude Pattern</Label>
              <Input 
                id={`${block.id}-exclude`}
                value={block.config.excludePattern || ''} 
                onChange={(e) => updateConfig('excludePattern', e.target.value)}
                placeholder="*temp*,*draft*"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated patterns to exclude
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${block.id}-size-filter`} 
                checked={block.config.sizeFilter || false}
                onCheckedChange={(checked) => updateConfig('sizeFilter', checked)}
              />
              <label
                htmlFor={`${block.id}-size-filter`}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Filter by file size
              </label>
            </div>
            
            {block.config.sizeFilter && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`${block.id}-min-size`} className="text-xs">Min Size (KB)</Label>
                  <Input 
                    id={`${block.id}-min-size`}
                    type="number"
                    value={block.config.minSize || ''} 
                    onChange={(e) => updateConfig('minSize', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`${block.id}-max-size`} className="text-xs">Max Size (KB)</Label>
                  <Input 
                    id={`${block.id}-max-size`}
                    type="number"
                    value={block.config.maxSize || ''} 
                    onChange={(e) => updateConfig('maxSize', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        );
        
      case 'process':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`${block.id}-action`} className="text-xs">Processing Action</Label>
              <Select 
                value={block.config.action || 'rename'} 
                onValueChange={(value) => updateConfig('action', value)}
              >
                <SelectTrigger id={`${block.id}-action`}>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rename">Rename Files</SelectItem>
                  <SelectItem value="categorize">Categorize Content</SelectItem>
                  <SelectItem value="extract">Extract Metadata</SelectItem>
                  <SelectItem value="analyze">Analyze Content</SelectItem>
                  <SelectItem value="transform">Transform/Convert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {block.config.action === 'rename' && (
              <div>
                <Label htmlFor={`${block.id}-pattern`} className="text-xs">Naming Pattern</Label>
                <Input 
                  id={`${block.id}-pattern`}
                  value={block.config.namingPattern || ''} 
                  onChange={(e) => updateConfig('namingPattern', e.target.value)}
                  placeholder="{date}-{category}-{name}"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {"{tokens}"} for dynamic values like {"{date}"}, {"{type}"}, etc.
                </p>
              </div>
            )}
            
            {block.config.action === 'categorize' && (
              <div>
                <Label htmlFor={`${block.id}-categories`} className="text-xs">Categories</Label>
                <Textarea 
                  id={`${block.id}-categories`}
                  value={block.config.categories || ''} 
                  onChange={(e) => updateConfig('categories', e.target.value)}
                  placeholder="Invoices,Reports,Contracts,Presentations"
                  className="h-20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated categories (leave empty for auto-detection)
                </p>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${block.id}-use-ai`} 
                checked={block.config.useAI || false}
                onCheckedChange={(checked) => updateConfig('useAI', checked)}
              />
              <label
                htmlFor={`${block.id}-use-ai`}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Use AI to enhance processing
              </label>
            </div>
          </div>
        );
        
      case 'output':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`${block.id}-dest-type`} className="text-xs">Destination Type</Label>
              <Select 
                value={block.config.destType || 'folder'} 
                onValueChange={(value) => updateConfig('destType', value)}
              >
                <SelectTrigger id={`${block.id}-dest-type`}>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="folder">Local Folder</SelectItem>
                  <SelectItem value="dropbox">Dropbox</SelectItem>
                  <SelectItem value="google-drive">Google Drive</SelectItem>
                  <SelectItem value="same">Same as Source</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {block.config.destType !== 'same' && (
              <div>
                <Label htmlFor={`${block.id}-dest-path`} className="text-xs">Destination Path</Label>
                <Input 
                  id={`${block.id}-dest-path`}
                  value={block.config.destPath || ''} 
                  onChange={(e) => updateConfig('destPath', e.target.value)}
                  placeholder="/path/to/destination"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${block.id}-create-structure`} 
                checked={block.config.createStructure || false}
                onCheckedChange={(checked) => updateConfig('createStructure', checked)}
              />
              <label
                htmlFor={`${block.id}-create-structure`}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Create folder structure if it doesn't exist
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${block.id}-overwrite`} 
                checked={block.config.overwrite || false}
                onCheckedChange={(checked) => updateConfig('overwrite', checked)}
              />
              <label
                htmlFor={`${block.id}-overwrite`}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Overwrite existing files
              </label>
            </div>
          </div>
        );
        
      case 'workflow':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor={`${block.id}-trigger`} className="text-xs">Trigger Type</Label>
              <Select 
                value={block.config.trigger || 'manual'} 
                onValueChange={(value) => updateConfig('trigger', value)}
              >
                <SelectTrigger id={`${block.id}-trigger`}>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual (Run on demand)</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="folder-watch">Folder Watcher</SelectItem>
                  <SelectItem value="api-hook">API Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {block.config.trigger === 'scheduled' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`${block.id}-schedule-type`} className="text-xs">Schedule Type</Label>
                  <Select 
                    value={block.config.scheduleType || 'daily'} 
                    onValueChange={(value) => updateConfig('scheduleType', value)}
                  >
                    <SelectTrigger id={`${block.id}-schedule-type`}>
                      <SelectValue placeholder="Schedule type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor={`${block.id}-schedule-time`} className="text-xs">Time</Label>
                  <Input 
                    id={`${block.id}-schedule-time`}
                    type="time"
                    value={block.config.scheduleTime || ''} 
                    onChange={(e) => updateConfig('scheduleTime', e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${block.id}-notify`} 
                checked={block.config.notify || false}
                onCheckedChange={(checked) => updateConfig('notify', checked)}
              />
              <label
                htmlFor={`${block.id}-notify`}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send notification when complete
              </label>
            </div>
          </div>
        );
        
      default:
        return <p className="text-sm text-muted-foreground">No configuration options available.</p>;
    }
  };
  
  return (
    <Draggable draggableId={block.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`mb-3 border rounded-lg ${block.enabled ? '' : 'opacity-60'}`}
        >
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3" {...provided.dragHandleProps}>
              <div className="text-muted-foreground cursor-grab">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className={`p-1.5 rounded-md ${block.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                {block.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium">{block.title}</h4>
                <p className="text-xs text-muted-foreground">{block.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={block.enabled}
                onCheckedChange={toggleEnabled}
              />
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onRemove(block.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isExpanded && (
            <div className="px-3 pb-3 pt-1 border-t">
              {renderConfigOptions()}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

// Main DragDropAgentConfig component
export default function DragDropAgentConfig({ agent, onSave, onCancel }: DragDropAgentConfigProps) {
  const [agentName, setAgentName] = useState(agent?.name || '');
  const [agentDescription, setAgentDescription] = useState(agent?.description || '');
  const [agentType, setAgentType] = useState<Agent['type']>(agent?.type || 'file_organizer');
  const [blocks, setBlocks] = useState<ConfigBlock[]>(() => {
    // If editing an existing agent, try to load its configuration
    if (agent?.config?.blocks) {
      return agent.config.blocks;
    }
    
    // Default blocks for a new agent
    return [
      {
        id: 'block-1',
        type: 'input',
        title: blockTypes['input'].title,
        description: blockTypes['input'].description,
        icon: blockTypes['input'].icon,
        config: { sourceType: 'folder', recursive: true },
        enabled: true
      },
      {
        id: 'block-2',
        type: 'filter',
        title: blockTypes['filter'].title,
        description: blockTypes['filter'].description,
        icon: blockTypes['filter'].icon,
        config: { pattern: '*.pdf,*.docx,*.txt' },
        enabled: true
      },
      {
        id: 'block-3',
        type: 'process',
        title: blockTypes['process'].title,
        description: blockTypes['process'].description,
        icon: blockTypes['process'].icon,
        config: { action: 'rename', useAI: true },
        enabled: true
      },
      {
        id: 'block-4',
        type: 'output',
        title: blockTypes['output'].title,
        description: blockTypes['output'].description,
        icon: blockTypes['output'].icon,
        config: { destType: 'same', createStructure: true },
        enabled: true
      }
    ];
  });
  
  // Toast for notifications
  const { toast } = useToast();
  
  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    
    // Reorder the blocks
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(source.index, 1);
    newBlocks.splice(destination.index, 0, removed);
    
    setBlocks(newBlocks);
  };
  
  // Add a new block
  const addBlock = (type: string) => {
    const newBlock: ConfigBlock = {
      id: getNewId(),
      type,
      title: blockTypes[type as keyof typeof blockTypes].title,
      description: blockTypes[type as keyof typeof blockTypes].description,
      icon: blockTypes[type as keyof typeof blockTypes].icon,
      config: {},
      enabled: true
    };
    
    setBlocks([...blocks, newBlock]);
  };
  
  // Update a block's configuration
  const updateBlock = (id: string, config: Record<string, any>, enabled: boolean) => {
    setBlocks(blocks.map(block => {
      if (block.id === id) {
        return { ...block, config, enabled };
      }
      return block;
    }));
  };
  
  // Remove a block
  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };
  
  // Save the agent configuration
  const handleSave = () => {
    if (!agentName.trim()) {
      toast({
        title: "Agent name required",
        description: "Please provide a name for your agent",
        variant: "destructive"
      });
      return;
    }
    
    const agentConfig = {
      blocks,
      agentType,
      // Add any other top-level configuration here
    };
    
    onSave(agentConfig);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Drag & Drop Agent Configuration</h2>
          <ContextualHelp topic="agent_config" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Workflow Configuration</CardTitle>
              <CardDescription>
                Drag and drop blocks to create your agent's workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="workflow-blocks">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-1"
                    >
                      {blocks.map((block, index) => (
                        <DraggableConfigBlock
                          key={block.id}
                          block={block}
                          index={index}
                          onUpdate={updateBlock}
                          onRemove={removeBlock}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              <div className="mt-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Block
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries(blockTypes).map(([type, { title, icon }]) => (
                      <DropdownMenuItem key={type} onClick={() => addBlock(type)}>
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-primary/10">
                            {icon}
                          </div>
                          <span>{title}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t pt-3">
              <p className="text-xs text-muted-foreground">
                Each block represents a step in your agent's workflow. Drag to reorder, toggle to enable/disable.
              </p>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agent Settings</CardTitle>
              <CardDescription>Basic agent configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input 
                  id="agent-name" 
                  value={agentName} 
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="My File Processor"
                />
              </div>
              
              <div>
                <Label htmlFor="agent-description">Description</Label>
                <Textarea 
                  id="agent-description" 
                  value={agentDescription} 
                  onChange={(e) => setAgentDescription(e.target.value)}
                  placeholder="Describe what this agent will do"
                  className="resize-none h-24"
                />
              </div>
              
              <div>
                <Label htmlFor="agent-type">Agent Type</Label>
                <Select 
                  value={agentType} 
                  onValueChange={(value: Agent['type']) => setAgentType(value)}
                >
                  <SelectTrigger id="agent-type">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file_organizer">File Organizer</SelectItem>
                    <SelectItem value="content_analyzer">Content Analyzer</SelectItem>
                    <SelectItem value="batch_processor">Batch Processor</SelectItem>
                    <SelectItem value="custom">Custom Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Advanced Options</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="advanced-logging" className="text-sm">Enhanced Logging</Label>
                    <FeatureHelp title="Enhanced Logging">
                      Enables detailed logging of all agent operations for better troubleshooting and debugging.
                    </FeatureHelp>
                  </div>
                  <Switch id="advanced-logging" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="save-presets" className="text-sm">Save as Preset</Label>
                    <FeatureHelp title="Save as Preset">
                      Save this configuration as a reusable preset for future agents.
                    </FeatureHelp>
                  </div>
                  <Switch id="save-presets" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="auto-retry" className="text-sm">Auto-Retry on Failure</Label>
                    <FeatureHelp title="Auto-Retry">
                      Automatically retry failed operations up to 3 times before reporting an error.
                    </FeatureHelp>
                  </div>
                  <Switch id="auto-retry" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}