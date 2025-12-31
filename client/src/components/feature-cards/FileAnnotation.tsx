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
  MessageSquareText,
  PanelTop,
  Settings,
  BarChart4,
  UserCircle,
  Share2,
  Highlighter,
  CheckCircle2,
  StickyNote,
  NotebookPen
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAnnotationStats } from "@/services/fileAnnotation";
import { AIFeature } from "@shared/schema";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

interface FileAnnotationProps {
  feature: AIFeature;
  onToggle: (id: number, status: 'active' | 'inactive') => Promise<void>;
}

export default function FileAnnotation({ feature, onToggle }: FileAnnotationProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEnabled = feature.status === 'active';
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/annotations/stats'],
    queryFn: getAnnotationStats,
    enabled: isEnabled,
    refetchOnWindowFocus: false
  });
  
  const toggleMutation = useMutation({
    mutationFn: () => onToggle(feature.id, isEnabled ? 'inactive' : 'active'),
    onSuccess: () => {
      toast({
        title: isEnabled ? "Feature disabled" : "Feature enabled",
        description: `File Annotation System has been ${isEnabled ? 'disabled' : 'enabled'}.`,
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
            <MessageSquareText className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg text-orange-500">Collaborative File Annotation System</CardTitle>
          </div>
          <Switch 
            checked={isEnabled}
            onCheckedChange={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
        <CardDescription className="text-zinc-400 mt-1">
          Add notes, highlights, and comments to files for team collaboration
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-900 border-b border-zinc-800 w-full rounded-none px-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
            <PanelTop className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-zinc-800">
            <BarChart4 className="h-4 w-4 mr-1" />
            Stats
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
                        <StickyNote className="h-4 w-4 mr-2 text-yellow-500" />
                        Notes & Comments
                      </h3>
                      <p className="text-xs text-zinc-400">Add contextual notes and detailed comments to specific sections of files.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <Highlighter className="h-4 w-4 mr-2 text-blue-500" />
                        Text Highlighting
                      </h3>
                      <p className="text-xs text-zinc-400">Mark important text sections with color-coded highlights for easy reference.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <Share2 className="h-4 w-4 mr-2 text-green-500" />
                        Team Collaboration
                      </h3>
                      <p className="text-xs text-zinc-400">Share annotations with team members and collaborate in real-time.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-purple-500" />
                        Task Assignment
                      </h3>
                      <p className="text-xs text-zinc-400">Create actionable tasks and assign them to team members directly on files.</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-lg p-4">
                    <h3 className="text-sm text-zinc-300 font-medium mb-2">How it works</h3>
                    <ol className="space-y-2 text-xs text-zinc-400 list-decimal pl-4">
                      <li>Upload or select an existing file in NameWizard.io</li>
                      <li>Enable the File Annotation feature</li>
                      <li>Click on any part of the file to add a note, highlight, or comment</li>
                      <li>Choose annotation type and add your content</li>
                      <li>Assign tasks or mention team members if needed</li>
                      <li>All annotations are saved and visible to your team</li>
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
                        Enable File Annotation
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "stats" && (
                <div className="space-y-4">
                  {isEnabled ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Total Annotations</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {statsLoading ? '...' : stats?.total || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Notes</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {statsLoading ? '...' : stats?.byType?.note || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Comments</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {statsLoading ? '...' : stats?.byType?.comment || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Tasks</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {statsLoading ? '...' : stats?.byType?.task || 0}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Highlights</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {statsLoading ? '...' : stats?.byType?.highlight || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Questions</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {statsLoading ? '...' : stats?.byType?.question || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Resolved</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {statsLoading ? '...' : stats?.resolved || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Unresolved</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {statsLoading ? '...' : stats?.unresolved || 0}
                          </p>
                        </div>
                      </div>
                      
                      {stats && stats.total === 0 && (
                        <div className="text-center p-8 text-zinc-500 text-sm">
                          <NotebookPen className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                          <p>No annotations created yet.</p>
                          <p className="text-xs mt-1">Stats will appear here after you create annotations.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8 text-zinc-500">
                      <NotebookPen className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                      <p className="text-sm">Enable File Annotation to view statistics</p>
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
                            <Label className="text-zinc-300">Make annotations private by default</Label>
                            <p className="text-xs text-zinc-500">Only you can see private annotations</p>
                          </div>
                          <Switch defaultChecked={false} className="data-[state=checked]:bg-orange-500" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Email notifications</Label>
                            <p className="text-xs text-zinc-500">Get notified when someone replies to your annotations</p>
                          </div>
                          <Switch defaultChecked={true} className="data-[state=checked]:bg-orange-500" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-zinc-300">Show annotation counts</Label>
                            <p className="text-xs text-zinc-500">Display number of annotations next to filenames</p>
                          </div>
                          <Switch defaultChecked={true} className="data-[state=checked]:bg-orange-500" />
                        </div>
                        
                        <div className="pt-2 border-t border-zinc-800 mt-4">
                          <h3 className="text-sm text-orange-500 font-medium mb-3">Annotation Colors</h3>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-zinc-300 mb-1 block">Note Color</Label>
                              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-zinc-300 text-sm">
                                <option value="yellow">Yellow (Default)</option>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="red">Red</option>
                              </select>
                            </div>
                            
                            <div>
                              <Label className="text-zinc-300 mb-1 block">Highlight Color</Label>
                              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-zinc-300 text-sm">
                                <option value="yellow">Yellow (Default)</option>
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="red">Red</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-3">
                          <Label className="text-zinc-300 mb-2 block">Default Annotation Type</Label>
                          <select className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-zinc-300 text-sm">
                            <option value="note">Note</option>
                            <option value="highlight">Highlight</option>
                            <option value="comment">Comment</option>
                            <option value="task">Task</option>
                            <option value="question">Question</option>
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
                      <p className="text-sm">Enable File Annotation to access settings</p>
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
              Collaboration
            </Badge>
            <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 ml-2">
              Team Feature
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