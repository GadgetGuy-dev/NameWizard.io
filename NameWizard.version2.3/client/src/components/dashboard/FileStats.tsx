import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Label } from "recharts";
import { FileHistoryItem } from "@/components/file-handling/FileHistoryTable";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FileStatsProps {
  fileHistory: FileHistoryItem[];
  isLoading: boolean;
}

export default function FileStats({ fileHistory = [], isLoading }: FileStatsProps) {
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const [fileTypeData, setFileTypeData] = useState<any[]>([]);
  const [aiUsageData, setAiUsageData] = useState<any[]>([]);
  const [filesPerDayData, setFilesPerDayData] = useState<any[]>([]);

  // Colors for charts
  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#fff7ed'];

  useEffect(() => {
    if (fileHistory && fileHistory.length > 0) {
      processFileTypeData();
      processAiUsageData();
      processFilesPerDayData();
    }
  }, [fileHistory, dateRange]);

  const processFileTypeData = () => {
    const filteredHistory = dateRange 
      ? fileHistory.filter(item => {
          const date = new Date(item.renamedAt);
          const monthStart = startOfMonth(dateRange);
          const monthEnd = endOfMonth(dateRange);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
      : fileHistory;

    const types: Record<string, number> = {};
    
    filteredHistory.forEach(item => {
      const type = item.fileType || 'unknown';
      types[type] = (types[type] || 0) + 1;
    });
    
    const data = Object.entries(types).map(([name, value]) => ({ name, value }));
    setFileTypeData(data);
  };

  const processAiUsageData = () => {
    const filteredHistory = dateRange 
      ? fileHistory.filter(item => {
          const date = new Date(item.renamedAt);
          const monthStart = startOfMonth(dateRange);
          const monthEnd = endOfMonth(dateRange);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
      : fileHistory;

    const aiUsed = filteredHistory.filter(item => item.usedAI).length;
    const manualRename = filteredHistory.length - aiUsed;
    
    setAiUsageData([
      { name: 'AI Renamed', value: aiUsed },
      { name: 'Manually Renamed', value: manualRename },
    ]);
  };

  const processFilesPerDayData = () => {
    const filteredHistory = dateRange 
      ? fileHistory.filter(item => {
          const date = new Date(item.renamedAt);
          const monthStart = startOfMonth(dateRange);
          const monthEnd = endOfMonth(dateRange);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
      : fileHistory;

    const days: Record<string, number> = {};
    
    filteredHistory.forEach(item => {
      const day = format(new Date(item.renamedAt), 'MMM dd');
      days[day] = (days[day] || 0) + 1;
    });
    
    const data = Object.entries(days)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        // Sort dates chronologically
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
    
    setFilesPerDayData(data);
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid gap-8 md:grid-cols-12">
      <div className="md:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Month</CardTitle>
            <CardDescription>Select a month to filter data</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={dateRange}
              onSelect={(date: Date | undefined) => setDateRange(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-9">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fileTypes">File Types</TabsTrigger>
            <TabsTrigger value="aiUsage">AI Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Files Processed Over Time</CardTitle>
                  <CardDescription>
                    Number of files processed per day
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-[300px] w-full" />
                    </div>
                  ) : filesPerDayData.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filesPerDayData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Files" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Stats Summary</CardTitle>
                  <CardDescription>
                    Summary of file renaming activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Total Files Processed
                        </h3>
                        <p className="text-3xl font-bold text-orange-500">
                          {fileHistory.length}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          AI-Assisted Renamings
                        </h3>
                        <p className="text-3xl font-bold text-orange-500">
                          {fileHistory.filter(item => item.usedAI).length}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          File Types Processed
                        </h3>
                        <p className="text-3xl font-bold text-orange-500">
                          {new Set(fileHistory.map(item => item.fileType)).size}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fileTypes">
            <Card>
              <CardHeader>
                <CardTitle>File Types Distribution</CardTitle>
                <CardDescription>
                  Breakdown of processed files by file type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-[400px] w-full" />
                  </div>
                ) : fileTypeData.length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fileTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fileTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aiUsage">
            <Card>
              <CardHeader>
                <CardTitle>AI vs Manual Renaming</CardTitle>
                <CardDescription>
                  Comparison of AI-assisted vs manual renaming
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-[400px] w-full" />
                  </div>
                ) : aiUsageData.length === 0 ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={aiUsageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {aiUsageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}