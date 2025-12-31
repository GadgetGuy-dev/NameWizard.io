import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

// Define help topics for different agent-related concepts
const helpTopics = {
  'agent_types': {
    title: 'Agent Types',
    content: (
      <div className="space-y-3">
        <p>NameWizard.io offers several specialized AI agents:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>File Organizer:</strong> Sorts files into logical folders based on content and naming patterns.</li>
          <li><strong>Content Analyzer:</strong> Extracts key information from documents, summarizes content, and identifies entities.</li>
          <li><strong>Batch Processor:</strong> Processes multiple files with the same rules, perfect for bulk operations.</li>
          <li><strong>Custom Agent:</strong> Build specialized workflows with custom configurations for unique needs.</li>
        </ul>
      </div>
    )
  },
  'agent_config': {
    title: 'Agent Configuration',
    content: (
      <div className="space-y-3">
        <p>Configure your agents to perform specific tasks:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Basic Settings:</strong> Name and describe your agent's purpose.</li>
          <li><strong>Advanced Features:</strong> Enable specific AI capabilities based on your needs.</li>
          <li><strong>Triggers:</strong> Set conditions for when your agent should run.</li>
          <li><strong>Output Options:</strong> Configure how results are presented and saved.</li>
        </ul>
        <p className="text-sm italic mt-2">Each agent type has specific configurable features. Enable only what you need for optimal performance.</p>
      </div>
    )
  },
  'agent_execution': {
    title: 'Running Agents',
    content: (
      <div className="space-y-3">
        <p>Your AI agents can be run in several ways:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>On-Demand:</strong> Run an agent manually when needed.</li>
          <li><strong>Scheduled:</strong> Set up regular automated runs.</li>
          <li><strong>Event-Triggered:</strong> Start processing when specific conditions are met.</li>
        </ul>
        <p className="text-sm mt-2">Agents process files according to your configuration and report results when complete.</p>
      </div>
    )
  },
  'agent_results': {
    title: 'Agent Results',
    content: (
      <div className="space-y-3">
        <p>After an agent completes its task, you can:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>View Summaries:</strong> See an overview of what was processed.</li>
          <li><strong>Examine Details:</strong> Review full processing information.</li>
          <li><strong>Download Results:</strong> Export data for further use.</li>
          <li><strong>Apply Changes:</strong> Implement the agent's recommendations.</li>
        </ul>
        <p className="text-sm mt-2">Results are saved to your history for future reference.</p>
      </div>
    )
  }
};

// Help context menu component
export function ContextualHelp({ topic }: { topic: keyof typeof helpTopics }) {
  const [open, setOpen] = useState(false);
  const helpInfo = helpTopics[topic];
  
  if (!helpInfo) return null;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-muted-foreground hover:text-primary hover:bg-background">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help information</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">{helpInfo.title}</h4>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setOpen(false)}>
            <X className="h-3 w-3" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="text-sm">
          {helpInfo.content}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Feature help bubble that displays when hovering over a feature
export function FeatureHelp({ 
  title, 
  children 
}: { 
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full text-muted-foreground hover:text-primary">
          <HelpCircle className="h-3 w-3" />
          <span className="sr-only">Feature help</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-2">
          <h5 className="font-medium text-xs">{title}</h5>
          <div className="text-xs text-muted-foreground">
            {children}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Inline help text component that can be used directly in forms
export function InlineHelp({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs text-muted-foreground mt-1 rounded-md bg-secondary/40 px-3 py-2">
      {children}
    </div>
  );
}

// Agent recommendation tip component
export function AgentRecommendation({ 
  title, 
  description 
}: { 
  title: string;
  description: string;
}) {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-md p-3 mt-4">
      <div className="flex items-start gap-2">
        <div className="p-1 rounded-full bg-primary/10 mt-0.5">
          <HelpCircle className="h-3 w-3 text-primary" />
        </div>
        <div>
          <h5 className="text-sm font-medium text-primary/90">{title}</h5>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}