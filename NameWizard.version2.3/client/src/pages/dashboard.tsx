import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { FileHistoryItem } from "@/components/file-handling/FileHistoryTable";
import FileHistoryTable from "@/components/file-handling/FileHistoryTable";
import FileStats from "@/components/dashboard/FileStats";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFileHistory();
  }, []);

  const fetchFileHistory = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest({
        url: "/api/file-history",
        method: "GET"
      });
      
      setFileHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch file history:", error);
      toast({
        title: "Error",
        description: "Failed to load file history data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-orange-500">File Renaming Dashboard</h1>
        <p className="text-zinc-500 mt-2">
          Track and analyze your file renaming activities
        </p>
      </header>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="history">File History</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <FileStats fileHistory={fileHistory} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="history">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">File History</h2>
            <p className="text-muted-foreground">
              View and manage your file renaming history
            </p>
          </div>
          <FileHistoryTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}