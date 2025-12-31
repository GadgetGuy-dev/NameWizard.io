import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FileText, Settings2, Save, RefreshCw } from "lucide-react";

interface CustomInstructions {
  id?: number;
  userId: number;
  namingStyle: string | null;
  separator: string | null;
  dateFormat: string | null;
  includeExtension: boolean;
  maxLength: number | null;
  prefix: string | null;
  suffix: string | null;
  customPrompt: string | null;
  outputLanguage: string | null;
  preserveOriginal: boolean;
}

const NAMING_STYLES = [
  { value: "camelCase", label: "camelCase" },
  { value: "snake_case", label: "snake_case" },
  { value: "kebab-case", label: "kebab-case" },
  { value: "PascalCase", label: "PascalCase" },
  { value: "Title Case", label: "Title Case" },
  { value: "lowercase", label: "lowercase" },
  { value: "UPPERCASE", label: "UPPERCASE" },
];

const DATE_FORMATS = [
  { value: "YYYY-MM-DD", label: "2024-01-15" },
  { value: "MM-DD-YYYY", label: "01-15-2024" },
  { value: "DD-MM-YYYY", label: "15-01-2024" },
  { value: "YYYYMMDD", label: "20240115" },
  { value: "MMM DD YYYY", label: "Jan 15 2024" },
];

const SEPARATORS = [
  { value: "-", label: "Hyphen (-)" },
  { value: "_", label: "Underscore (_)" },
  { value: ".", label: "Period (.)" },
  { value: " ", label: "Space" },
];

export default function CustomInstructionsPanel() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<CustomInstructions>>({
    namingStyle: "kebab-case",
    separator: "-",
    dateFormat: "YYYY-MM-DD",
    includeExtension: true,
    maxLength: 100,
    prefix: "",
    suffix: "",
    customPrompt: "",
    outputLanguage: "en",
    preserveOriginal: false,
  });

  const { data: instructions, isLoading } = useQuery<CustomInstructions>({
    queryKey: ["/api/custom-instructions"],
  });

  useEffect(() => {
    if (instructions) {
      setFormData({
        namingStyle: instructions.namingStyle || "kebab-case",
        separator: instructions.separator || "-",
        dateFormat: instructions.dateFormat || "YYYY-MM-DD",
        includeExtension: instructions.includeExtension ?? true,
        maxLength: instructions.maxLength || 100,
        prefix: instructions.prefix || "",
        suffix: instructions.suffix || "",
        customPrompt: instructions.customPrompt || "",
        outputLanguage: instructions.outputLanguage || "en",
        preserveOriginal: instructions.preserveOriginal ?? false,
      });
    }
  }, [instructions]);

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<CustomInstructions>) => {
      const response = await fetch("/api/custom-instructions", {
        method: instructions?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save instructions");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-instructions"] });
      toast({ title: "Saved", description: "Your naming preferences have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save instructions", variant: "destructive" });
    },
  });

  const generatePreview = () => {
    const parts: string[] = [];
    if (formData.prefix) parts.push(formData.prefix);
    parts.push("document");
    if (formData.dateFormat) parts.push(formData.dateFormat === "YYYY-MM-DD" ? "2024-01-15" : "01-15-2024");
    if (formData.suffix) parts.push(formData.suffix);
    
    let result = parts.join(formData.separator || "-");
    
    if (formData.namingStyle === "camelCase") {
      result = result.replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase());
    } else if (formData.namingStyle === "snake_case") {
      result = result.replace(/[-\s]+/g, "_").toLowerCase();
    } else if (formData.namingStyle === "UPPERCASE") {
      result = result.toUpperCase();
    }
    
    if (formData.includeExtension) result += ".pdf";
    if (formData.maxLength && result.length > formData.maxLength) {
      result = result.substring(0, formData.maxLength);
    }
    
    return result;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-orange-500" />
          Custom Naming Instructions
        </CardTitle>
        <CardDescription>
          Configure how AI generates file names for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="namingStyle">Naming Style</Label>
            <Select
              value={formData.namingStyle || "kebab-case"}
              onValueChange={(value) => setFormData({ ...formData, namingStyle: value })}
            >
              <SelectTrigger data-testid="select-naming-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NAMING_STYLES.map(style => (
                  <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="separator">Separator</Label>
            <Select
              value={formData.separator || "-"}
              onValueChange={(value) => setFormData({ ...formData, separator: value })}
            >
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
            <Label htmlFor="dateFormat">Date Format</Label>
            <Select
              value={formData.dateFormat || "YYYY-MM-DD"}
              onValueChange={(value) => setFormData({ ...formData, dateFormat: value })}
            >
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

          <div className="space-y-2">
            <Label htmlFor="maxLength">Max Filename Length</Label>
            <Input
              id="maxLength"
              type="number"
              min={20}
              max={255}
              value={formData.maxLength || 100}
              onChange={(e) => setFormData({ ...formData, maxLength: parseInt(e.target.value) })}
              data-testid="input-max-length"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prefix">Prefix</Label>
            <Input
              id="prefix"
              placeholder="e.g., DOC_"
              value={formData.prefix || ""}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              data-testid="input-prefix"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input
              id="suffix"
              placeholder="e.g., _final"
              value={formData.suffix || ""}
              onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
              data-testid="input-suffix"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customPrompt">Custom Instructions for AI</Label>
          <Textarea
            id="customPrompt"
            placeholder="Add any special instructions for how AI should name your files..."
            value={formData.customPrompt || ""}
            onChange={(e) => setFormData({ ...formData, customPrompt: e.target.value })}
            className="min-h-[100px]"
            data-testid="input-custom-prompt"
          />
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="includeExtension"
              checked={formData.includeExtension ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, includeExtension: checked })}
              data-testid="switch-include-extension"
            />
            <Label htmlFor="includeExtension">Include file extension</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="preserveOriginal"
              checked={formData.preserveOriginal ?? false}
              onCheckedChange={(checked) => setFormData({ ...formData, preserveOriginal: checked })}
              data-testid="switch-preserve-original"
            />
            <Label htmlFor="preserveOriginal">Keep original name in output</Label>
          </div>
        </div>

        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-sm break-all" data-testid="text-preview">{generatePreview()}</p>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button
            onClick={() => saveMutation.mutate(formData)}
            disabled={saveMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600"
            data-testid="button-save"
          >
            {saveMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
