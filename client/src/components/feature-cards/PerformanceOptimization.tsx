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
  Zap, 
  Image, 
  FileText, 
  Headphones, 
  Video, 
  Settings, 
  PanelTop, 
  BarChart,
  ArrowDownSquare
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOptimizationMetrics, getOptimizationSettings, saveOptimizationSettings } from "@/services/performanceOptimization";
import { AIFeature } from "@shared/schema";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

interface PerformanceOptimizationProps {
  feature: AIFeature;
  onToggle: (id: number, status: 'active' | 'inactive') => Promise<void>;
}

export default function PerformanceOptimization({ feature, onToggle }: PerformanceOptimizationProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEnabled = feature.status === 'active';
  
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/performance-optimization/metrics'],
    queryFn: getOptimizationMetrics,
    enabled: isEnabled,
    refetchOnWindowFocus: false
  });
  
  const { data: settings } = useQuery({
    queryKey: ['/api/performance-optimization/settings'],
    queryFn: getOptimizationSettings,
    enabled: isEnabled,
    refetchOnWindowFocus: false
  });
  
  const toggleMutation = useMutation({
    mutationFn: () => onToggle(feature.id, isEnabled ? 'inactive' : 'active'),
    onSuccess: () => {
      toast({
        title: isEnabled ? "Feature disabled" : "Feature enabled",
        description: `Performance Optimization has been ${isEnabled ? 'disabled' : 'enabled'}.`,
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
    mutationFn: saveOptimizationSettings,
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your optimization settings have been updated.",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/performance-optimization/settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <Card className="w-full bg-black border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg text-orange-500">One-Click Performance Optimization</CardTitle>
          </div>
          <Switch 
            checked={isEnabled}
            onCheckedChange={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className="data-[state=checked]:bg-orange-500"
          />
        </div>
        <CardDescription className="text-zinc-400 mt-1">
          Optimize file size and performance with intelligent compression techniques
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-zinc-900 border-b border-zinc-800 w-full rounded-none px-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-800">
            <PanelTop className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-zinc-800">
            <BarChart className="h-4 w-4 mr-1" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <Image className="h-4 w-4 mr-2 text-blue-500" />
                        Image Optimization
                      </h3>
                      <p className="text-xs text-zinc-400">Compress images, convert to modern formats like WebP, and strip unnecessary metadata.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <FileText className="h-4 w-4 mr-2 text-green-500" />
                        Document Compression
                      </h3>
                      <p className="text-xs text-zinc-400">Optimize PDFs and documents while preserving quality and searchability.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <Headphones className="h-4 w-4 mr-2 text-purple-500" />
                        Audio Enhancement
                      </h3>
                      <p className="text-xs text-zinc-400">Reduce audio file sizes with optimal encoding while maintaining quality.</p>
                    </div>
                    
                    <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                      <h3 className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                        <Video className="h-4 w-4 mr-2 text-red-500" />
                        Video Compression
                      </h3>
                      <p className="text-xs text-zinc-400">Smart video optimization balancing file size and visual quality.</p>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-lg p-4">
                    <h3 className="text-sm text-zinc-300 font-medium mb-2">How it works</h3>
                    <ol className="space-y-2 text-xs text-zinc-400 list-decimal pl-4">
                      <li>Upload your files to NameWizard.io</li>
                      <li>Enable Performance Optimization</li>
                      <li>Select optimization level (automatic by default)</li>
                      <li>Click "Optimize Files" button</li>
                      <li>Review optimization results with size reduction metrics</li>
                      <li>Download or save the optimized files</li>
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
                        Enable Performance Optimization
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "metrics" && (
                <div className="space-y-4">
                  {isEnabled ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Files Optimized</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {metricsLoading ? '...' : metrics?.totalFilesOptimized || 0}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Space Saved</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {metricsLoading ? '...' : formatSize(metrics?.totalSpaceSaved || 0)}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Avg. Compression</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {metricsLoading ? '...' : `${Math.round((metrics?.averageCompressionRatio || 0) * 100)}%`}
                          </p>
                        </div>
                        <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                          <p className="text-xs text-zinc-500 mb-1">Images Optimized</p>
                          <p className="text-lg font-semibold text-zinc-200">
                            {metricsLoading ? '...' : metrics?.imagesSaved || 0}
                          </p>
                        </div>
                      </div>
                      
                      {metrics && metrics.totalFilesOptimized === 0 && (
                        <div className="text-center p-8 text-zinc-500 text-sm">
                          <ArrowDownSquare className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                          <p>No files optimized yet.</p>
                          <p className="text-xs mt-1">Metrics will appear here after you optimize your files.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8 text-zinc-500">
                      <ArrowDownSquare className="mx-auto h-12 w-12 text-zinc-700 mb-3" />
                      <p className="text-sm">Enable Performance Optimization to view metrics</p>
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
                        <div>
                          <h3 className="text-sm text-orange-500 font-semibold mb-3">Image Settings</h3>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <Label className="text-zinc-300">Enable image optimization</Label>
                              <p className="text-xs text-zinc-500">Compress images to reduce file size</p>
                            </div>
                            <Switch defaultChecked={settings?.image.enabled} className="data-[state=checked]:bg-orange-500" />
                          </div>
                          
                          <div className="mb-3">
                            <Label className="text-zinc-300 mb-1 block">Quality</Label>
                            <div className="flex space-x-2 text-xs text-zinc-500">
                              <span>Low</span>
                              <input 
                                type="range" 
                                min="60" 
                                max="100" 
                                defaultValue={settings?.image.quality || 85}
                                className="flex-1" 
                              />
                              <span>High</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-zinc-300">Convert to WebP</Label>
                              <p className="text-xs text-zinc-500">Use modern image format for better compression</p>
                            </div>
                            <Switch defaultChecked={settings?.image.convertToWebP} className="data-[state=checked]:bg-orange-500" />
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-zinc-800">
                          <h3 className="text-sm text-orange-500 font-semibold mb-3">Document Settings</h3>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-zinc-300">Enable document optimization</Label>
                              <p className="text-xs text-zinc-500">Compress PDFs and office documents</p>
                            </div>
                            <Switch defaultChecked={settings?.document.enabled} className="data-[state=checked]:bg-orange-500" />
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <Label className="text-zinc-300">Remove hidden data</Label>
                              <p className="text-xs text-zinc-500">Strip metadata and other hidden content</p>
                            </div>
                            <Switch defaultChecked={settings?.document.removeHiddenData} className="data-[state=checked]:bg-orange-500" />
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-zinc-800">
                          <h3 className="text-sm text-orange-500 font-semibold mb-2">General Settings</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-zinc-300">Preserve original files</Label>
                              <p className="text-xs text-zinc-500">Keep the original file when optimizing</p>
                            </div>
                            <Switch defaultChecked={settings?.preserveOriginal} className="data-[state=checked]:bg-orange-500" />
                          </div>
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
                      <p className="text-sm">Enable Performance Optimization to access settings</p>
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
              Advanced
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