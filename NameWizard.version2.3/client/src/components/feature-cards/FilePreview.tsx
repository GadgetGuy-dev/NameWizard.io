import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye,
  FileEdit,
  MessageSquare,
  PanelTop,
  Settings,
  ScanBarcode,
  Check,
  Glasses
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPreviewSettings, savePreviewSettings } from "@/services/filePreview";
import { AIFeature } from "@shared/schema";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

interface FilePreviewProps {
  feature: AIFeature;
  onToggle: (id: number, status: 'active' | 'inactive') => Promise<void>;
}

export default function FilePreview({ feature, onToggle }: FilePreviewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEnabled = feature.status === 'active';
  
  const { data: settings } = useQuery({
    queryKey: ['/api/file-preview/settings'],
    queryFn: getPreviewSettings,
    enabled: isEnabled,
    refetchOnWindowFocus: false
  });
  
  const toggleMutation = useMutation({
    mutationFn: () => onToggle(feature.id, isEnabled ? 'inactive' : 'active'),
    onSuccess: () => {
      toast({
        title: isEnabled ? "Feature disabled" : "Feature enabled",
        description: `File Preview Modal has been ${isEnabled ? 'disabled' : 'enabled'}.`,
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
  
  const settingsMutation = useMutation({
    mutationFn: savePreviewSettings,
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your preview settings have been updated.",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/file-preview/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return (
    <Card className="w-full bg-black border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg text-orange-500">Intuitive File Renaming Preview Modal</CardTitle>
          </div>
          <Switch 
            checked={isEnabled}
            onCheckedChange={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
        <CardDescription className="text-zinc-400 mt-1">
          Preview renamed files before applying changes with AI suggestions
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-900 border-b border-zinc-800 w-full rounded-none px-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
            <PanelTop className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-zinc-800">
            <Glasses className="h-4 w-4 mr-1" />
            Preview
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
                        <Eye className="h-4 w-4 mr-2 text-orange-500" />
                        Real-time Preview
                      </h3>
                      <p className="text-xs text-zinc-400">See how your files will look before applying new names, with before-and-after comparison.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <MessageSquare className="h-4 w-4 mr-2 text-orange-500" />
                        AI Reasoning
                      </h3>
                      <p className="text-xs text-zinc-400">Understand why the AI is suggesting specific renames with detailed explanations.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <FileEdit className="h-4 w-4 mr-2 text-orange-500" />
                        Manual Editing
                      </h3>
                      <p className="text-xs text-zinc-400">Edit AI suggestions directly in the preview modal before confirming changes.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <ScanBarcode className="h-4 w-4 mr-2 text-orange-500" />
                        Change Highlighting
                      </h3>
                      <p className="text-xs text-zinc-400">See exactly what parts of filenames have changed with visual highlighting.</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-lg p-4">
                    <h3 className="text-sm text-zinc-300 font-medium mb-2">How it works</h3>
                    <ol className="space-y-2 text-xs text-zinc-400 list-decimal pl-4">
                      <li>Upload your files to NameWizard.io</li>
                      <li>Enable the File Preview feature</li>
                      <li>Enter your renaming pattern or select a preset</li>
                      <li>Click "Preview Changes" to see the transformation</li>
                      <li>Edit any suggested names if needed</li>
                      <li>Apply changes when you're satisfied</li>
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
                        Enable File Preview
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "preview" && (
                <div className="space-y-4">
                  {isEnabled ? (
                    <div className="space-y-4">
                      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                        <h3 className="text-sm font-medium text-zinc-300 mb-3">Preview Example</h3>
                        
                        <div className="space-y-3">
                          <div className="bg-black/40 border border-zinc-800 rounded-md p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-zinc-500">Original filename</span>
                              <Badge variant="outline" className="bg-zinc-800/50 text-xs">IMG_20250412_143024.jpg</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-500">Preview name</span>
                              <Badge variant="outline" className="bg-orange-950/30 text-orange-400 border-orange-800 text-xs">Paris_Eiffel_Tower_April_12_2025.jpg</Badge>
                            </div>
                          </div>
                          
                          <div className="bg-black/40 border border-zinc-800 rounded-md p-3">
                            <h4 className="text-xs font-medium text-zinc-400 mb-2">AI Reasoning</h4>
                            <p className="text-xs text-zinc-500">This image appears to contain the Eiffel Tower in Paris based on the visual content analysis. I've restructured the filename to be more descriptive and included the date from the original filename.</p>
                          </div>
                          
                          <div className="bg-black/40 border border-zinc-800 rounded-md p-3">
                            <h4 className="text-xs font-medium text-zinc-400 mb-2">Alternative Suggestions</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-zinc-500">1.</span>
                                <Badge variant="outline" className="bg-zinc-800/50 text-xs">Paris_Vacation_April_2025.jpg</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-zinc-500">2.</span>
                                <Badge variant="outline" className="bg-zinc-800/50 text-xs">Eiffel_Tower_Afternoon_2025-04-12.jpg</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-3 space-x-2">
                          <Button variant="outline" size="sm" className="text-xs bg-zinc-800 hover:bg-zinc-700">
                            Edit
                          </Button>
                          <Button size="sm" className="text-xs bg-orange-600 hover:bg-orange-700">
                            <Check className="h-3 w-3 mr-1" />
                            Apply
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-zinc-500">This is a static preview example. Enable and use the feature with your files to see it in action.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-zinc-500">
                      <Eye className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                      <p className="text-sm">Enable File Preview to see this feature in action</p>
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
                            <Label className="text-zinc-300">Show alternative suggestions</Label>
                            <p className="text-xs text-zinc-500">Display multiple name options for each file</p>
                          </div>
                          <Switch 
                            defaultChecked={settings?.showAlternatives} 
                            className="data-[state=checked]:bg-orange-500" 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Show AI reasoning</Label>
                            <p className="text-xs text-zinc-500">Display why the AI suggested specific names</p>
                          </div>
                          <Switch 
                            defaultChecked={settings?.showReasoning} 
                            className="data-[state=checked]:bg-orange-500" 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Highlight changes</Label>
                            <p className="text-xs text-zinc-500">Visually highlight modified parts of filenames</p>
                          </div>
                          <Switch 
                            defaultChecked={settings?.highlightChanges} 
                            className="data-[state=checked]:bg-orange-500" 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Use Advanced AI Naming</Label>
                            <p className="text-xs text-zinc-500">Use more advanced AI for better suggestions</p>
                          </div>
                          <Switch 
                            defaultChecked={settings?.useAdvancedNaming} 
                            className="data-[state=checked]:bg-orange-500" 
                          />
                        </div>
                        
                        <div className="pt-2">
                          <Label className="text-zinc-300 mb-2 block">AI Model for Previews</Label>
                          <select className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-zinc-300 text-sm">
                            <option value="gpt_4o">GPT-4o (Recommended)</option>
                            <option value="claude_3_5_sonnet">Claude 3.5 Sonnet</option>
                            <option value="llama_3_2_90b">Llama 3.2 90B</option>
                          </select>
                        </div>
                        
                        <div className="pt-2">
                          <Label className="text-zinc-300 mb-2 block">Batch Size</Label>
                          <select className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-zinc-300 text-sm">
                            <option value="10">10 files per batch</option>
                            <option value="25" selected>25 files per batch (recommended)</option>
                            <option value="50">50 files per batch</option>
                            <option value="100">100 files per batch</option>
                          </select>
                          <p className="text-xs text-zinc-500 mt-1">Larger batch sizes may increase processing time</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="outline"
                          className="bg-orange-950/30 text-orange-400 border-orange-800 hover:bg-orange-950/50"
                          onClick={() => settingsMutation.mutate(settings!)}
                          disabled={settingsMutation.isPending}
                        >
                          Save Settings
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 text-zinc-500">
                      <Settings className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                      <p className="text-sm">Enable File Preview to access settings</p>
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