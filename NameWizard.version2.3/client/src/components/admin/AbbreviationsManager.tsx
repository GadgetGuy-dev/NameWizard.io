import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, BookOpen, Search } from "lucide-react";

interface Abbreviation {
  id: number;
  fullText: string;
  abbreviation: string;
  category: string | null;
  isSystem: boolean;
}

const CATEGORIES = ["document", "date", "version", "status", "department", "custom"];

export default function AbbreviationsManager() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [newFullText, setNewFullText] = useState("");
  const [newAbbreviation, setNewAbbreviation] = useState("");
  const [newCategory, setNewCategory] = useState("custom");

  const { data: abbreviations, isLoading } = useQuery<Abbreviation[]>({
    queryKey: ["/api/abbreviations"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { fullText: string; abbreviation: string; category: string }) => {
      const response = await fetch("/api/abbreviations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create abbreviation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/abbreviations"] });
      toast({ title: "Added", description: "Abbreviation has been added." });
      setNewFullText("");
      setNewAbbreviation("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add abbreviation", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/abbreviations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete abbreviation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/abbreviations"] });
      toast({ title: "Deleted", description: "Abbreviation has been removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete abbreviation", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    if (!newFullText.trim() || !newAbbreviation.trim()) {
      toast({ title: "Error", description: "Please fill in both fields", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      fullText: newFullText.toLowerCase(),
      abbreviation: newAbbreviation.toUpperCase(),
      category: newCategory,
    });
  };

  const filteredAbbreviations = (abbreviations || []).filter(a =>
    a.fullText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryColors: Record<string, string> = {
    document: "bg-blue-500/20 text-blue-400",
    date: "bg-green-500/20 text-green-400",
    version: "bg-purple-500/20 text-purple-400",
    status: "bg-orange-500/20 text-orange-400",
    department: "bg-cyan-500/20 text-cyan-400",
    custom: "bg-gray-500/20 text-gray-400",
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-orange-500" />
          Abbreviations Dictionary
        </CardTitle>
        <CardDescription>
          Manage abbreviations used during AI file renaming ({(abbreviations || []).length} entries)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label>Full Text</Label>
            <Input
              placeholder="e.g., invoice"
              value={newFullText}
              onChange={(e) => setNewFullText(e.target.value)}
              data-testid="input-full-text"
            />
          </div>
          <div className="space-y-2">
            <Label>Abbreviation</Label>
            <Input
              placeholder="e.g., INV"
              value={newAbbreviation}
              onChange={(e) => setNewAbbreviation(e.target.value)}
              data-testid="input-abbreviation"
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full h-10 px-3 border rounded-md bg-background"
              data-testid="select-category"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="w-full bg-orange-500 hover:bg-orange-600"
              data-testid="button-add-abbreviation"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search abbreviations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Text</TableHead>
                <TableHead>Abbreviation</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAbbreviations.map((abbr) => (
                <TableRow key={abbr.id} data-testid={`row-abbr-${abbr.id}`}>
                  <TableCell className="font-medium">{abbr.fullText}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{abbr.abbreviation}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={categoryColors[abbr.category || "custom"]}>
                      {abbr.category || "custom"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {abbr.isSystem ? (
                      <Badge variant="secondary">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!abbr.isSystem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(abbr.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${abbr.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
