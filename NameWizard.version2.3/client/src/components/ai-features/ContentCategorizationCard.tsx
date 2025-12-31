import React, { useState, useEffect } from 'react';
import { 
  Folder, FolderUp, RefreshCw, PlusCircle, FileText, 
  Image, Presentation, Table, Palmtree, Mountain, Building2,
  Briefcase, User, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileItem } from '@/pages/home';
import { CategoryMapping, getAvailableCategories, addCustomCategory } from '@/services/contentCategorization';

interface ContentCategorizationCardProps {
  onCategorize: () => Promise<void>;
  isProcessing: boolean;
  hasFiles: boolean;
  categorizedFiles: Record<string, FileItem[]>;
  enabled: boolean;
  onToggleFeature: (enabled: boolean) => void;
}

// Get the icon component based on the icon name string
const getCategoryIcon = (iconName?: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'file-text': <FileText className="h-4 w-4" />,
    'image': <Image className="h-4 w-4" />,
    'presentation': <Presentation className="h-4 w-4" />,
    'table': <Table className="h-4 w-4" />,
    'palmtree': <Palmtree className="h-4 w-4" />,
    'mountain-snow': <Mountain className="h-4 w-4" />,
    'building-2': <Building2 className="h-4 w-4" />,
    'briefcase': <Briefcase className="h-4 w-4" />,
    'user': <User className="h-4 w-4" />,
  };

  return iconName && iconMap[iconName] ? iconMap[iconName] : <Folder className="h-4 w-4" />;
};

export default function ContentCategorizationCard({
  onCategorize,
  isProcessing,
  hasFiles,
  categorizedFiles,
  enabled,
  onToggleFeature
}: ContentCategorizationCardProps) {
  const { toast } = useToast();
  const [availableCategories] = useState<CategoryMapping[]>(getAvailableCategories());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    folder: '',
    patterns: '',
    description: ''
  });
  const [activeTab, setActiveTab] = useState('available');

  // Effect to automatically switch to the current tab when files are categorized
  useEffect(() => {
    if (Object.keys(categorizedFiles).length > 0 && activeTab === 'available') {
      setActiveTab('current');
    }
  }, [categorizedFiles, activeTab]);

  const handleToggle = (enabled: boolean) => {
    onToggleFeature(enabled);
    toast({
      title: enabled ? "Feature Enabled" : "Feature Disabled",
      description: enabled 
        ? "Content categorization is now active" 
        : "Content categorization has been disabled",
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.folder || !newCategory.patterns) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Create the new category
    const category = addCustomCategory({
      name: newCategory.name,
      folder: newCategory.folder,
      patterns: newCategory.patterns.split(',').map(p => p.trim()),
      description: newCategory.description,
      examples: [],
      icon: 'folder'
    });

    toast({
      title: "Category Added",
      description: `Added category "${category.name}" for folders`
    });

    // Reset form and close dialog
    setNewCategory({
      name: '',
      folder: '',
      patterns: '',
      description: ''
    });
    setAddDialogOpen(false);
  };

  // Group categories by type for a better UI presentation
  const categoryGroups = {
    documents: availableCategories.filter(c => ['documents', 'presentations', 'spreadsheets'].includes(c.id)),
    photos: availableCategories.filter(c => ['images', 'vacation', 'beach', 'mountains', 'city'].includes(c.id)),
    organization: availableCategories.filter(c => ['work', 'personal'].includes(c.id))
  };

  return (
    <Card className="overflow-hidden bg-zinc-950 border border-zinc-800 shadow-lg">
      <CardHeader className="bg-zinc-900 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-orange-400 flex items-center gap-2">
            <Folder className="h-5 w-5" /> 
            Content-Based Categorization
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="categorization-switch" className="text-xs text-zinc-500">
              {enabled ? "Enabled" : "Disabled"}
            </Label>
            <Switch 
              id="categorization-switch" 
              checked={enabled}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        </div>
        <CardDescription className="text-zinc-400">
          AI-powered auto-sorting organizes files into relevant folders using content analysis — perfect for vacation photos (beach/mountains/city) and more!
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <Tabs defaultValue="available" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full bg-zinc-900">
            <TabsTrigger 
              value="available" 
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              Available Categories
            </TabsTrigger>
            <TabsTrigger 
              value="current" 
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
              disabled={Object.keys(categorizedFiles).length === 0}
            >
              Categorized Folders
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-300">Photo Categories</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center text-zinc-500 hover:text-zinc-300">
                      <Info className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Categories for organizing photos by content type</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {categoryGroups.photos.map(category => (
                  <div key={category.id} className="flex items-center p-2 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition">
                    <div className="flex-shrink-0 text-orange-400 mr-3">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-200 truncate">{category.name}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="bg-zinc-800 text-zinc-400 text-xs">
                                {category.patterns.length} patterns
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Matches: {category.patterns.slice(0, 5).join(', ')}{category.patterns.length > 5 ? '...' : ''}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      {category.description && (
                        <p className="text-xs text-zinc-400 truncate">{category.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-2">Document Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryGroups.documents.map(category => (
                    <div key={category.id} className="flex items-center p-2 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition">
                      <div className="flex-shrink-0 text-orange-400 mr-3">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-zinc-200 truncate">{category.name}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="bg-zinc-800 text-zinc-400 text-xs">
                                  {category.patterns.length} patterns
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Matches: {category.patterns.slice(0, 5).join(', ')}{category.patterns.length > 5 ? '...' : ''}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {category.description && (
                          <p className="text-xs text-zinc-400 truncate">{category.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-zinc-300 mb-2">Organization Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categoryGroups.organization.map(category => (
                    <div key={category.id} className="flex items-center p-2 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition">
                      <div className="flex-shrink-0 text-orange-400 mr-3">
                        {getCategoryIcon(category.icon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-zinc-200 truncate">{category.name}</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="outline" className="bg-zinc-800 text-zinc-400 text-xs">
                                  {category.patterns.length} patterns
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Matches: {category.patterns.slice(0, 5).join(', ')}{category.patterns.length > 5 ? '...' : ''}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {category.description && (
                          <p className="text-xs text-zinc-400 truncate">{category.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 w-full bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Custom Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                  <DialogHeader>
                    <DialogTitle className="text-orange-400">Add Custom Category</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Create a new category for auto-sorting your files.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-zinc-300">Category Name</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g., Project XYZ" 
                        className="bg-zinc-900 border-zinc-700 text-zinc-200"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="folder" className="text-zinc-300">Folder Name</Label>
                      <Input 
                        id="folder" 
                        placeholder="e.g., Project_XYZ" 
                        className="bg-zinc-900 border-zinc-700 text-zinc-200"
                        value={newCategory.folder}
                        onChange={(e) => setNewCategory({...newCategory, folder: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="patterns" className="text-zinc-300">
                        Match Patterns <span className="text-zinc-500 text-xs">(comma separated)</span>
                      </Label>
                      <Input 
                        id="patterns" 
                        placeholder="e.g., project, xyz, confidential" 
                        className="bg-zinc-900 border-zinc-700 text-zinc-200"
                        value={newCategory.patterns}
                        onChange={(e) => setNewCategory({...newCategory, patterns: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="text-zinc-300">Description (optional)</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Brief description of this category" 
                        className="bg-zinc-900 border-zinc-700 text-zinc-200"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={handleAddCategory}
                    >
                      Add Category
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
          
          <TabsContent value="current" className="space-y-4 mt-4">
            {Object.keys(categorizedFiles).length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                  {Object.entries(categorizedFiles).map(([category, files]) => {
                    // Find the matching category config if it exists
                    const categoryConfig = availableCategories.find(c => c.folder === category);
                    
                    return (
                      <div key={category} className="bg-zinc-900 p-3 rounded-md border border-zinc-800">
                        <div className="flex items-center gap-2 text-zinc-300 font-medium mb-2">
                          <div className="text-orange-400">
                            {categoryConfig ? getCategoryIcon(categoryConfig.icon) : <Folder className="h-4 w-4" />}
                          </div>
                          <span>{category}</span>
                          <Badge className="ml-auto bg-zinc-800 text-zinc-400">
                            {files.length} {files.length === 1 ? 'file' : 'files'}
                          </Badge>
                        </div>
                        
                        <div className="ml-6 space-y-1">
                          {files.slice(0, 5).map(file => (
                            <div key={file.id} className="text-xs text-zinc-400 flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-orange-500/30"></div>
                              <span className="truncate">{file.original}</span>
                            </div>
                          ))}
                          {files.length > 5 && (
                            <div className="text-xs text-zinc-500">
                              + {files.length - 5} more files
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-400">
                <p>No Folders Organized</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Add files and click "Auto-Organize Into Folders" to sort them using GPT-4o
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <Separator className="bg-zinc-800" />
      
      <CardFooter className="p-4 bg-zinc-900">
        <Button
          onClick={onCategorize}
          disabled={isProcessing || !hasFiles || !enabled}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> 
              Processing...
            </>
          ) : (
            <>
              <FolderUp className="h-4 w-4" /> 
              Auto-Organize Into Folders
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}