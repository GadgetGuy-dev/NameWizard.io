import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, FileText, Plus, Edit2, Trash2, Copy, Check, Eye, Save, X, Tag, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import TemplateBuilder from '@/components/templates/TemplateBuilder';
import AbbreviationsManager from '@/components/admin/AbbreviationsManager';

interface Template {
  id: string;
  name: string;
  pattern: string;
  description: string;
  createdAt: Date;
  usageCount: number;
}

const VARIABLE_CHIPS = [
  { label: '{index}', description: 'Sequential number', example: '001' },
  { label: '{date}', description: 'Current date (YYYY-MM-DD)', example: '2025-01-15' },
  { label: '{time}', description: 'Current time (HH-mm)', example: '14-30' },
  { label: '{originalName}', description: 'Original filename', example: 'document' },
  { label: '{extension}', description: 'File extension', example: 'pdf' },
  { label: '{year}', description: 'Current year', example: '2025' },
  { label: '{month}', description: 'Current month', example: '01' },
  { label: '{day}', description: 'Current day', example: '15' },
];

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Date Prefix',
    pattern: '{date}_{originalName}.{extension}',
    description: 'Adds current date as prefix',
    createdAt: new Date('2025-01-01'),
    usageCount: 45
  },
  {
    id: '2',
    name: 'Sequential Numbering',
    pattern: '{originalName}_{index}.{extension}',
    description: 'Adds sequential number suffix',
    createdAt: new Date('2025-01-05'),
    usageCount: 32
  },
  {
    id: '3',
    name: 'Archive Format',
    pattern: '{year}/{month}/{originalName}_{index}.{extension}',
    description: 'Organizes with year/month folders',
    createdAt: new Date('2025-01-10'),
    usageCount: 18
  },
];

const RenamingTemplatesPage = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newName, setNewName] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [previewName, setPreviewName] = useState('example_document.pdf');

  const applyPattern = (pattern: string): string => {
    const now = new Date();
    const baseName = previewName.includes('.') ? previewName.split('.').slice(0, -1).join('.') : previewName;
    const ext = previewName.includes('.') ? previewName.split('.').pop() : '';
    
    return pattern
      .replace('{index}', '001')
      .replace('{date}', now.toISOString().split('T')[0])
      .replace('{time}', now.toTimeString().slice(0, 5).replace(':', '-'))
      .replace('{originalName}', baseName)
      .replace('{extension}', ext || '')
      .replace('{year}', String(now.getFullYear()))
      .replace('{month}', String(now.getMonth() + 1).padStart(2, '0'))
      .replace('{day}', String(now.getDate()).padStart(2, '0'));
  };

  const handleSaveTemplate = () => {
    if (!newName || !newPattern) {
      toast({ title: "Name and pattern are required", variant: "destructive" });
      return;
    }

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? { ...t, name: newName, pattern: newPattern, description: newDescription }
          : t
      ));
      toast({ title: "Template updated" });
    } else {
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: newName,
        pattern: newPattern,
        description: newDescription,
        createdAt: new Date(),
        usageCount: 0
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast({ title: "Template created" });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewName(template.name);
    setNewPattern(template.pattern);
    setNewDescription(template.description);
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({ title: "Template deleted" });
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      usageCount: 0
    };
    setTemplates(prev => [...prev, duplicate]);
    toast({ title: "Template duplicated" });
  };

  const insertVariable = (variable: string) => {
    setNewPattern(prev => prev + variable);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setNewName('');
    setNewPattern('');
    setNewDescription('');
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Link href="/" className="inline-flex items-center text-orange-500 hover:text-orange-400">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center text-orange-500 hover:text-orange-400"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-orange-500 flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Renaming Templates
            </h1>
            <p className="text-zinc-400 mt-1">Create and manage reusable file naming patterns</p>
          </div>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="bg-zinc-900 border-zinc-800">
            <TabsTrigger value="templates" data-testid="tab-templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="builder" data-testid="tab-builder">
              <Plus className="h-4 w-4 mr-2" />
              Template Builder
            </TabsTrigger>
            <TabsTrigger value="abbreviations" data-testid="tab-abbreviations">
              <BookOpen className="h-4 w-4 mr-2" />
              Abbreviations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-6">
            <TemplateBuilder />
          </TabsContent>

          <TabsContent value="abbreviations" className="mt-6">
            <AbbreviationsManager />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <div className="flex justify-end mb-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenDialog} className="bg-orange-600 hover:bg-orange-700" data-testid="create-template-button">
                    <Plus className="h-4 w-4 mr-2" /> New Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-orange-500">
                      {editingTemplate ? 'Edit Template' : 'Create New Template'}
                    </DialogTitle>
                    <DialogDescription>
                      Define a naming pattern using variables below
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-zinc-300">Template Name</Label>
                      <Input 
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Invoice Format"
                        className="bg-zinc-800 border-zinc-700"
                        data-testid="template-name-input"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300">Pattern</Label>
                      <Input 
                        value={newPattern}
                        onChange={e => setNewPattern(e.target.value)}
                        placeholder="e.g. {date}_{originalName}.{extension}"
                        className="bg-zinc-800 border-zinc-700 font-mono"
                        data-testid="template-pattern-input"
                      />
                    </div>
                    <div>
                      <Label className="text-zinc-300 mb-2 block">Variable Chips (click to insert)</Label>
                      <div className="flex flex-wrap gap-2">
                        {VARIABLE_CHIPS.map(chip => (
                          <Button
                            key={chip.label}
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(chip.label)}
                            className="border-zinc-700 hover:bg-orange-600/20 hover:border-orange-500"
                            title={`${chip.description} (e.g. ${chip.example})`}
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {chip.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-300">Description (optional)</Label>
                      <Input 
                        value={newDescription}
                        onChange={e => setNewDescription(e.target.value)}
                        placeholder="Brief description of this template"
                        className="bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                      <Label className="text-zinc-400 text-sm">Live Preview</Label>
                      <div className="mt-2">
                        <div className="text-xs text-zinc-500 mb-1">Input: {previewName}</div>
                        <div className="text-sm text-orange-400 font-mono">
                          Output: {newPattern ? applyPattern(newPattern) : '(enter pattern above)'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTemplate} className="bg-orange-600 hover:bg-orange-700" data-testid="save-template-button">
                      <Save className="h-4 w-4 mr-2" /> {editingTemplate ? 'Update' : 'Create'} Template
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <Card key={template.id} className="bg-zinc-900 border-zinc-800" data-testid={`template-card-${template.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-orange-500 text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                        Used {template.usageCount}x
                      </Badge>
                    </div>
                    <CardDescription className="text-zinc-400">
                      {template.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 rounded bg-zinc-950 border border-zinc-800 mb-4">
                      <code className="text-sm text-orange-300 font-mono break-all">
                        {template.pattern}
                      </code>
                    </div>
                    <div className="mb-4">
                      <div className="text-xs text-zinc-500 mb-1">Preview:</div>
                      <div className="text-sm text-zinc-300">{applyPattern(template.pattern)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-zinc-700"
                        onClick={() => handleEditTemplate(template)}
                        data-testid={`edit-template-${template.id}`}
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-zinc-700"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-700 text-red-400 hover:bg-red-600/10"
                        onClick={() => handleDeleteTemplate(template.id)}
                        data-testid={`delete-template-${template.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {templates.length === 0 && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                  <h3 className="text-lg font-medium mb-2">No templates yet</h3>
                  <p className="text-zinc-400 mb-4">Create your first renaming template to get started</p>
                  <Button onClick={handleOpenDialog} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" /> Create Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RenamingTemplatesPage;
