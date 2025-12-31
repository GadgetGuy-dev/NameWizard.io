import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Save, FileText, Calendar, User, Hash, Tag, GripVertical } from "lucide-react";

interface NamingTemplate {
  id: number;
  name: string;
  category: string;
  pattern: string;
  fields: string[];
  dateFormat: string | null;
  separator: string | null;
  example: string | null;
  isSystem: boolean;
}

const AVAILABLE_TAGS = [
  { id: "content", label: "Content", icon: FileText, description: "Document content summary" },
  { id: "date", label: "Date", icon: Calendar, description: "Document date" },
  { id: "owner", label: "Owner", icon: User, description: "Document owner/author" },
  { id: "type", label: "Type", icon: Tag, description: "Document type" },
  { id: "version", label: "Version", icon: Hash, description: "Version number" },
  { id: "project", label: "Project", icon: Tag, description: "Project name" },
];

const SEPARATORS = [
  { value: "-", label: "Hyphen (-)" },
  { value: "_", label: "Underscore (_)" },
  { value: ".", label: "Period (.)" },
  { value: " ", label: "Space" },
];

const DATE_FORMATS = [
  { value: "YYYY-MM-DD", label: "2024-01-15" },
  { value: "YYYYMMDD", label: "20240115" },
  { value: "MM-DD-YYYY", label: "01-15-2024" },
  { value: "DD-MM-YYYY", label: "15-01-2024" },
];

export default function TemplateBuilder() {
  const { toast } = useToast();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [separator, setSeparator] = useState("-");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [selectedTemplate, setSelectedTemplate] = useState<NamingTemplate | null>(null);

  const { data: templates, isLoading } = useQuery<NamingTemplate[]>({
    queryKey: ["/api/naming-templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<NamingTemplate>) => {
      const response = await fetch("/api/naming-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/naming-templates"] });
      toast({ title: "Template created", description: "Your naming template has been saved." });
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create template", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTemplateName("");
    setSelectedTags([]);
    setSeparator("-");
    setDateFormat("YYYY-MM-DD");
    setSelectedTemplate(null);
  };

  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagId));
  };

  const generatePattern = () => {
    return selectedTags.map(t => `{${t}}`).join(separator);
  };

  const generatePreview = () => {
    const sampleValues: Record<string, string> = {
      content: "invoice",
      date: dateFormat === "YYYY-MM-DD" ? "2024-01-15" : dateFormat === "YYYYMMDD" ? "20240115" : "01-15-2024",
      owner: "john-doe",
      type: "pdf",
      version: "v2",
      project: "project-alpha",
    };
    return selectedTags.map(t => sampleValues[t] || t).join(separator);
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast({ title: "Error", description: "Please enter a template name", variant: "destructive" });
      return;
    }
    if (selectedTags.length === 0) {
      toast({ title: "Error", description: "Please select at least one tag", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      name: templateName,
      category: "custom",
      pattern: generatePattern(),
      fields: selectedTags,
      dateFormat,
      separator,
      example: generatePreview(),
      isSystem: false,
    });
  };

  const loadTemplate = (template: NamingTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setSelectedTags(template.fields || []);
    setSeparator(template.separator || "-");
    setDateFormat(template.dateFormat || "YYYY-MM-DD");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Template Builder
          </CardTitle>
          <CardDescription>Create custom naming patterns by adding tags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              placeholder="e.g., Project Documents"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              data-testid="input-template-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Available Tags</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const Icon = tag.icon;
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <Button
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => isSelected ? removeTag(tag.id) : addTag(tag.id)}
                    className={isSelected ? "bg-orange-500 hover:bg-orange-600" : ""}
                    data-testid={`tag-${tag.id}`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {tag.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Selected Pattern</Label>
            <div className="min-h-[60px] border rounded-lg p-3 bg-muted/50 flex flex-wrap gap-2 items-center">
              {selectedTags.length === 0 ? (
                <span className="text-muted-foreground text-sm">Click tags above to build your pattern</span>
              ) : (
                selectedTags.map((tagId, index) => {
                  const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                  return (
                    <div key={tagId} className="flex items-center gap-1">
                      {index > 0 && <span className="text-orange-500 font-bold">{separator}</span>}
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <GripVertical className="h-3 w-3" />
                        {tag?.label || tagId}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeTag(tagId)}
                        />
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Separator</Label>
              <Select value={separator} onValueChange={setSeparator}>
                <SelectTrigger data-testid="select-separator">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEPARATORS.map(sep => (
                    <SelectItem key={sep.value} value={sep.value}>{sep.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger data-testid="select-date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map(fmt => (
                    <SelectItem key={fmt.value} value={fmt.value}>{fmt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-sm break-all text-orange-400" data-testid="text-preview">
                {selectedTags.length > 0 ? generatePreview() + ".pdf" : "Select tags to see preview"}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
              data-testid="button-save-template"
            >
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
            <Button variant="outline" onClick={resetForm} data-testid="button-reset">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Existing Templates</CardTitle>
          <CardDescription>Click to load and edit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {(templates || []).map((template) => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer hover:border-orange-500 transition-colors ${
                  selectedTemplate?.id === template.id ? "border-orange-500 bg-orange-500/10" : ""
                }`}
                onClick={() => loadTemplate(template)}
                data-testid={`template-${template.id}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{template.name}</span>
                  {template.isSystem && (
                    <Badge variant="secondary" className="text-xs">System</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{template.pattern}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
