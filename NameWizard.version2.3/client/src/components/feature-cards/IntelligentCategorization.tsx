import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { FolderTree, PanelTop, FileSpreadsheet, CheckCircle, FolderInput, Brain, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategorizationMetrics, CategoryResults } from "@/services/intelligentCategorization";
import { AIFeature } from "@shared/schema";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

interface IntelligentCategorizationProps {
  feature: AIFeature;
  onToggle: (id: number, status: 'active' | 'inactive') => Promise<void>;
}

export default function IntelligentCategorization({ feature, onToggle }: IntelligentCategorizationProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEnabled = feature.status === 'active';
  
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/intelligent-categorization/metrics'],
    queryFn: getCategorizationMetrics,
    enabled: isEnabled,
    refetchOnWindowFocus: false
  });
  
  const toggleMutation = useMutation({
    mutationFn: () => onToggle(feature.id, isEnabled ? 'inactive' : 'active'),
    onSuccess: () => {
      toast({
        title: isEnabled ? "Feature disabled" : "Feature enabled",
        description: `Intelligent File Categorization has been ${isEnabled ? 'disabled' : 'enabled'}.`,
        variant: isEnabled ? "default" : "success"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-features'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to toggle feature status. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return (
    <Card className="w-full bg-black border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg text-orange-500">Intelligent File Categorization AI</CardTitle>
          </div>
          <Switch 
            checked={isEnabled}
            onCheckedChange={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
        <CardDescription className="text-zinc-400 mt-1">
          Advanced content-based file categorization using AI analysis
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-900 border-b border-zinc-800 w-full rounded-none px-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
            <PanelTop className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-zinc-800">
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-800">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <CardContent className="pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={fadeIn}
            >
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <FolderTree className="h-4 w-4 mr-2 text-orange-500" />
                        Content Analysis
                      </h3>
                      <p className="text-xs text-zinc-400">Analyze file contents and metadata to automatically determine the most appropriate categories for your files.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <FolderInput className="h-4 w-4 mr-2 text-orange-500" />
                        Auto Folder Organization
                      </h3>
                      <p className="text-xs text-zinc-400">Files are automatically sorted into relevant folders based on their content, type, and metadata.</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-lg p-4">
                    <h3 className="text-sm text-zinc-300 font-medium mb-2">How it works</h3>
                    <ol className="space-y-2 text-xs text-zinc-400 list-decimal pl-4">
                      <li>Upload your files to NameWizard.io</li>
                      <li>Enable Intelligent Categorization</li>
                      <li>Click "Auto-Organize Into Folders" button</li>
                      <li>AI analyzes file metadata and content patterns</li>
                      <li>Files are sorted into suggested folders</li>
                      <li>Review and apply the organization</li>
                    </ol>
                  </div>
                  
                  {!isEnabled && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        className="bg-orange-950/30 text-orange-400 border-orange-800 hover:bg-orange-950/50"
                        onClick={() => toggleMutation.mutate()}
                        disabled={toggleMutation.isPending}
                      >
                        Enable Intelligent Categorization
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "metrics" && (
                <div className="space-y-4">
                  {isEnabled ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Total Categorizations</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {metricsLoading ? '...' : metrics?.totalCategorizations || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Unique Categories</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {metricsLoading ? '...' : metrics?.uniqueCategories || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Files Categorized</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {metricsLoading ? '...' : metrics?.categorizedFiles || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Accuracy Rating</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {metricsLoading ? '...' : `${(metrics?.accuracyRating || 0) * 100}%`}
                          </p>
                        </div>
                      </div>
                      
                      {metrics && metrics.totalCategorizations === 0 && (
                        <div className="text-center p-8 text-zinc-500 text-sm">
                          <FolderTree className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                          <p>No categorizations performed yet.</p>
                          <p className="text-xs mt-1">Files will appear here after you use the intelligent categorization feature.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8 text-zinc-500">
                      <FolderTree className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                      <p className="text-sm">Enable Intelligent Categorization to view metrics</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 bg-orange-950/30 text-orange-400 border-orange-800 hover:bg-orange-950/50"
                        onClick={() => toggleMutation.mutate()}
                        disabled={toggleMutation.isPending}
                      >
                        Enable Feature
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "settings" && (
                <div className="space-y-4">
                  {isEnabled ? (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Auto-categorize on upload</Label>
                            <p className="text-xs text-zinc-500">Automatically categorize files when uploaded</p>
                          </div>
                          <Switch defaultChecked={false} className="data-[state=checked]:bg-orange-500" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Create missing folders</Label>
                            <p className="text-xs text-zinc-500">Create new folders when categories don't exist</p>
                          </div>
                          <Switch defaultChecked={true} className="data-[state=checked]:bg-orange-500" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Analyze file content</Label>
                            <p className="text-xs text-zinc-500">Deeply analyze file content for better categorization</p>
                          </div>
                          <Switch defaultChecked={true} className="data-[state=checked]:bg-orange-500" />
                        </div>
                        
                        <div className="pt-2">
                          <Label className="text-zinc-300 mb-2 block">AI Model for Categorization</Label>
                          <select className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-zinc-300 text-sm">
                            <option value="gpt_4o">GPT-4o (Recommended)</option>
                            <option value="claude_3_5_sonnet">Claude 3.5 Sonnet</option>
                            <option value="llama_3_2_90b">Llama 3.2 90B</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="outline"
                          className="bg-orange-950/30 text-orange-400 border-orange-800 hover:bg-orange-950/50"
                        >
                          Save Settings
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 text-zinc-500">
                      <Settings className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                      <p className="text-sm">Enable Intelligent Categorization to access settings</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 bg-orange-950/30 text-orange-400 border-orange-800 hover:bg-orange-950/50"
                        onClick={() => toggleMutation.mutate()}
                        disabled={toggleMutation.isPending}
                      >
                        Enable Feature
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t border-zinc-800 px-6 py-3">
        <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center">
            <Badge variant="outline" className="text-xs bg-orange-950/30 text-orange-400 border-orange-800">
              AI-Powered
            </Badge>
          </div>
          
          {isEnabled && (
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs bg-zinc-900 hover:bg-zinc-800 border-zinc-800"
              onClick={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
            >
              Disable Feature
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}