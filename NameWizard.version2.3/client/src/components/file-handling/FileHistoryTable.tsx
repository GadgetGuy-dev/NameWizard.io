import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Trash2, Download, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface FileHistoryItem {
  id: number;
  originalFilename: string;
  newFilename: string;
  fileSize: number;
  fileType: string;
  renamedAt: string;
  usedAI: boolean;
  aiModel?: string;
  categorizedBy?: string;
  userId: number;
}

interface FileHistoryTableProps {
  history: FileHistoryItem[];
  onDelete: (id: number) => void;
  isLoading: boolean;
}

function FileHistoryTable({ history, onDelete, isLoading }: FileHistoryTableProps) {
  const [selectedFile, setSelectedFile] = useState<FileHistoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = (file: FileHistoryItem) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedFile) {
      onDelete(selectedFile.id);
      setDeleteDialogOpen(false);
    }
  };

  const showDetails = (file: FileHistoryItem) => {
    setSelectedFile(file);
    setDetailsDialogOpen(true);
  };

  const handleDownload = async (file: FileHistoryItem) => {
    try {
      // Use fetch directly for blob responses
      const response = await fetch(`/api/download/${file.id}`, {
        method: "GET",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.newFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Original Filename</TableHead>
              <TableHead>New Filename</TableHead>
              <TableHead>File Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Renamed At</TableHead>
              <TableHead>AI Used</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history && history.length > 0 ? (
              history.map((file: FileHistoryItem) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium truncate max-w-[150px]" title={file.originalFilename}>
                    {file.originalFilename}
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]" title={file.newFilename}>
                    {file.newFilename}
                  </TableCell>
                  <TableCell>{file.fileType}</TableCell>
                  <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                  <TableCell>{format(new Date(file.renamedAt), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {file.usedAI ? (
                      <Badge variant="default" className="bg-purple-500">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => showDetails(file)}
                        title="View Details"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file)}
                        title="Download File"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file)}
                        title="Delete Entry"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No file history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file history entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Original Filename:</div>
                <div className="text-sm break-all">{selectedFile.originalFilename}</div>
                
                <div className="text-sm font-medium">New Filename:</div>
                <div className="text-sm break-all">{selectedFile.newFilename}</div>
                
                <div className="text-sm font-medium">File Type:</div>
                <div className="text-sm">{selectedFile.fileType}</div>
                
                <div className="text-sm font-medium">File Size:</div>
                <div className="text-sm">{formatFileSize(selectedFile.fileSize)}</div>
                
                <div className="text-sm font-medium">Renamed At:</div>
                <div className="text-sm">
                  {format(new Date(selectedFile.renamedAt), "PPpp")}
                </div>
                
                <div className="text-sm font-medium">AI Used:</div>
                <div className="text-sm">
                  {selectedFile.usedAI ? "Yes" : "No"}
                </div>
                
                {selectedFile.usedAI && selectedFile.aiModel && (
                  <>
                    <div className="text-sm font-medium">AI Model:</div>
                    <div className="text-sm">{selectedFile.aiModel}</div>
                  </>
                )}
                
                {selectedFile.categorizedBy && (
                  <>
                    <div className="text-sm font-medium">Categorized By:</div>
                    <div className="text-sm">{selectedFile.categorizedBy}</div>
                  </>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FileHistoryTable;