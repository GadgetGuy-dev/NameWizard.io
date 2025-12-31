import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  FileUp, 
  FileCog, 
  FileCheck, 
  Clock, 
  Calendar,
  Plus,
  FolderOpen,
  FileDigit,
  FileBadge
} from "lucide-react";

// Type imports
import type { Agent } from "./AgentManagement";

// AI recommendation model for agents
interface AgentRecommendation {
  id: string;
  title: string;
  description: string;
  type: Agent['type'];
  confidence: number; // 0-100
  tags: string[];
  icon: keyof typeof recommendationIcons;
}

// Recommendation icons mapping
const recommendationIcons = {
  "file-organizer": FileCog,
  "content-analyzer": FileDigit,
  "batch-processor": FileBadge,
  "custom-agent": FileCheck,
  "folder": FolderOpen,
  "schedule": Calendar,
  "instant": Clock
};

// Sample recommendations (in a real app, these would come from an API)
const sampleRecommendations: AgentRecommendation[] = [
  {
    id: "rec-1",
    title: "Document Organizer",
    description: "Organize your PDF and Word documents into folders based on content categories like 'Invoices', 'Reports', and 'Contracts'.",
    type: "file_organizer",
    confidence: 92,
    tags: ["documents", "organization", "content-based"],
    icon: "file-organizer"
  },
  {
    id: "rec-2",
    title: "Image Metadata Extractor",
    description: "Extract and analyze metadata from your image files to enable better searchability and organization.",
    type: "content_analyzer",
    confidence: 87,
    tags: ["images", "metadata", "analysis"],
    icon: "content-analyzer"
  },
  {
    id: "rec-3",
    title: "Weekly Report Processor",
    description: "Process your weekly reports to extract key metrics and compile them into a summary dashboard.",
    type: "batch_processor",
    confidence: 78,
    tags: ["reports", "scheduled", "analytics"],
    icon: "batch-processor"
  },
  {
    id: "rec-4",
    title: "Smart File Renamer",
    description: "Automatically rename files based on their content and metadata using AI analysis.",
    type: "custom",
    confidence: 85,
    tags: ["renaming", "organization", "custom"],
    icon: "custom-agent"
  }
];

// Recommendation card component
function RecommendationCard({ 
  recommendation,
  onCreateAgent
}: { 
  recommendation: AgentRecommendation;
  onCreateAgent: (rec: AgentRecommendation) => void;
}) {
  const Icon = recommendationIcons[recommendation.icon];
  
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">{recommendation.title}</CardTitle>
          </div>
          <Badge variant="outline" className="px-2 py-0 h-5 text-xs">
            {Math.round(recommendation.confidence)}% match
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{recommendation.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {recommendation.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Button 
          size="sm" 
          className="w-full flex items-center gap-1"
          onClick={() => onCreateAgent(recommendation)}
        >
          <Plus className="h-4 w-4" />
          Create Agent
        </Button>
      </CardFooter>
    </Card>
  );
}

// Agent recommendation engine props
interface AgentRecommendationEngineProps {
  onCreateRecommendedAgent: (type: Agent['type'], name: string, description: string) => void;
}

// Main recommendation engine component
export default function AgentRecommendationEngine({ onCreateRecommendedAgent }: AgentRecommendationEngineProps) {
  // In a real app, we would fetch this data from an API endpoint based on the user's uploads and behavior
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>(sampleRecommendations);
  
  // Recent file uploads (in a real app, these would come from an API)
  const recentUploads = [
    { id: 1, name: "financial_report_q1.pdf", date: "2025-03-28T14:22:00", type: "pdf" },
    { id: 2, name: "customer_data_march.xlsx", date: "2025-03-29T09:15:00", type: "spreadsheet" },
    { id: 3, name: "product_images_batch.zip", date: "2025-03-30T11:30:00", type: "archive" }
  ];
  
  // Handle create agent from recommendation
  const handleCreateAgent = (recommendation: AgentRecommendation) => {
    onCreateRecommendedAgent(
      recommendation.type,
      recommendation.title,
      recommendation.description
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">AI-Powered Agent Recommendations</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Based on Your Recent Activity</CardTitle>
          <CardDescription>Personalized recommendations for your workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map(recommendation => (
              <RecommendationCard 
                key={recommendation.id} 
                recommendation={recommendation} 
                onCreateAgent={handleCreateAgent}
              />
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-sm font-medium mb-3">Recent Uploads</h3>
            <div className="space-y-2">
              {recentUploads.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-secondary">
                      <FileUp className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(file.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">{file.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/40 py-2 px-6 flex justify-between">
          <p className="text-xs text-muted-foreground">Recommendations are based on your usage patterns and file types</p>
          <Button variant="link" className="text-xs p-0 h-auto">Refresh</Button>
        </CardFooter>
      </Card>
    </div>
  );
}