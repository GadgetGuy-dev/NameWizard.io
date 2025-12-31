import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TableHead, 
  TableRow, 
  TableHeader, 
  TableCell, 
  TableBody, 
  Table 
} from '@/components/ui/table';
import { formatFileSize } from '@/utils/fileUtils';
import { Loader2, Search, Clock, Filter, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Sample file history data type
interface FileHistoryEntry {
  id: number;
  originalName: string;
  newName: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  type: string;
  size: number;
}

const FileHistoryPage: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileHistoryEntry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Sample file history data
  const [historyEntries, setHistoryEntries] = useState<FileHistoryEntry[]>([
    {
      id: 1,
      originalName: 'Screenshot_2025-04-01.png',
      newName: 'Marketing_Meeting_Notes_2025-04-01.png',
      timestamp: '2025-04-16T13:45:30Z',
      status: 'success',
      type: 'image/png',
      size: 2458000
    },
    {
      id: 2,
      originalName: 'IMG_20250331_153342.jpg',
      newName: 'Product_Demo_Setup_2025-03-31.jpg',
      timestamp: '2025-04-15T09:23:15Z',
      status: 'success',
      type: 'image/jpeg',
      size: 4256000
    },
    {
      id: 3,
      originalName: 'Doc1.pdf',
      newName: 'Q1_Financial_Report_2025.pdf',
      timestamp: '2025-04-14T16:11:42Z',
      status: 'success',
      type: 'application/pdf',
      size: 1563000
    },
    {
      id: 4,
      originalName: 'Untitled.pptx',
      newName: 'Client_Presentation_2025-04-10.pptx',
      timestamp: '2025-04-10T11:08:55Z',
      status: 'failed',
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      size: 8125000
    },
    {
      id: 5,
      originalName: 'recording.mp3',
      newName: 'Team_Meeting_Recording_2025-04-05.mp3',
      timestamp: '2025-04-05T14:33:27Z',
      status: 'success',
      type: 'audio/mpeg',
      size: 15420000
    }
  ]);

  // In a real app, fetch history data from API
  useEffect(() => {
    const fetchFileHistory = async () => {
      // Simulating API request
      setIsLoading(true);
      try {
        // Fetch data from API in real implementation
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching file history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load file history',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    fetchFileHistory();
  }, [toast]);

  // Apply filters and search
  const filteredEntries = historyEntries.filter(entry => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      entry.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.newName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Time filter
    let matchesTime = true;
    const entryDate = new Date(entry.timestamp);
    const now = new Date();
    
    if (timeFilter === 'today') {
      matchesTime = entryDate.toDateString() === now.toDateString();
    } else if (timeFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesTime = entryDate >= oneWeekAgo;
    } else if (timeFilter === 'month') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      matchesTime = entryDate >= oneMonthAgo;
    }
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    return matchesSearch && matchesTime && matchesStatus;
  });

  // Sort entries
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return sortDirection === 'asc' 
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else if (sortBy === 'size') {
      return sortDirection === 'asc' ? a.size - b.size : b.size - a.size;
    } else if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.originalName.localeCompare(b.originalName)
        : b.originalName.localeCompare(a.originalName);
    }
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleDelete = (entry: FileHistoryEntry) => {
    setSelectedItem(entry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      // In a real app, make API call to delete
      setHistoryEntries(entries => entries.filter(e => e.id !== selectedItem.id));
      toast({
        title: 'Entry deleted',
        description: 'File history entry has been removed',
      });
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <MainLayout>
      <div className="py-4">
        <h1 className="text-2xl font-bold">File History</h1>
        <p className="text-zinc-400 mt-1">View and manage your file renaming history</p>
      </div>

      <div className="bg-zinc-950 rounded-lg p-6">
        {/* Search and filters row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by filename..."
              className="pl-9 pr-4 py-2 bg-zinc-900 border-zinc-800 focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-zinc-500" />
                  <SelectValue placeholder="Time" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-zinc-500" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* History table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : sortedEntries.length > 0 ? (
          <div className="rounded-md border border-zinc-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-900">
                <TableRow>
                  <TableHead>
                    <button 
                      className="flex items-center text-zinc-400 hover:text-zinc-200" 
                      onClick={() => handleSort('name')}
                    >
                      Original Filename
                      {sortBy === 'name' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>New Filename</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center text-zinc-400 hover:text-zinc-200" 
                      onClick={() => handleSort('timestamp')}
                    >
                      Renamed At
                      {sortBy === 'timestamp' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center text-zinc-400 hover:text-zinc-200" 
                      onClick={() => handleSort('size')}
                    >
                      Size
                      {sortBy === 'size' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium truncate max-w-[200px]" title={entry.originalName}>
                      {entry.originalName}
                    </TableCell>
                    <TableCell className="truncate max-w-[200px]" title={entry.newName}>
                      {entry.newName}
                    </TableCell>
                    <TableCell>{format(new Date(entry.timestamp), 'MMM dd, yyyy h:mm a')}</TableCell>
                    <TableCell>{formatFileSize(entry.size)}</TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          entry.status === 'success' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' :
                          entry.status === 'failed' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' :
                          'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                        }
                      >
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => handleDelete(entry)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-zinc-500">
            <p>No file history entries found.</p>
            {(searchTerm || timeFilter !== 'all' || statusFilter !== 'all') && (
              <p className="mt-2">Try changing your search or filter settings.</p>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete history entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will permanently remove this entry from your file history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default FileHistoryPage;