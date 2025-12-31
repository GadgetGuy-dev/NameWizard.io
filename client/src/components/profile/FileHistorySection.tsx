import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  Download, 
  MoreVertical, 
  Repeat, 
  Search, 
  Trash2,
  Filter,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileHistoryEntry {
  id: number;
  originalName: string;
  newName: string;
  timestamp: string;
  status: 'success' | 'failed';
  type: string;
  size: number;
}

const FileHistorySection: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
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
      newName: 'Team_Meeting_Discussion_2025-04-05.mp3',
      timestamp: '2025-04-07T14:32:19Z',
      status: 'success',
      type: 'audio/mpeg',
      size: 15789000
    },
  ]);
  
  const handleDelete = (id: number) => {
    setHistoryEntries(entries => entries.filter(entry => entry.id !== id));
    
    toast({
      title: "Entry deleted",
      description: "File history entry has been removed",
      variant: "default",
    });
  };
  
  const handleReprocess = (id: number) => {
    // In a real app, this would call the API to reprocess the file
    
    toast({
      title: "Reprocessing file",
      description: "File has been submitted for reprocessing",
      variant: "default",
    });
  };
  
  const handleDownload = (entry: FileHistoryEntry) => {
    // In a real app, this would trigger a file download
    
    toast({
      title: "Downloading file",
      description: `Downloading ${entry.newName}...`,
      variant: "default",
    });
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };
  
  const toggleSortDirection = (column: string) => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  const filteredAndSortedEntries = historyEntries
    .filter(entry => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!entry.originalName.toLowerCase().includes(searchLower) && 
            !entry.newName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Apply time filter
      if (timeFilter !== 'all') {
        const entryDate = new Date(entry.timestamp);
        const now = new Date();
        
        if (timeFilter === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (entryDate < today) return false;
        } else if (timeFilter === 'thisWeek') {
          const weekStart = new Date();
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          if (entryDate < weekStart) return false;
        } else if (timeFilter === 'thisMonth') {
          const monthStart = new Date();
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          if (entryDate < monthStart) return false;
        }
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && entry.status !== statusFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'timestamp') {
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'originalName') {
        comparison = a.originalName.localeCompare(b.originalName);
      } else if (sortBy === 'newName') {
        comparison = a.newName.localeCompare(b.newName);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">File History</h2>
        <p className="text-zinc-400 text-sm">View and manage your file renaming history</p>
      </div>
      
      <div className="bg-zinc-950 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search by filename..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border-zinc-800 pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-40">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <Clock className="w-4 h-4 mr-2 text-zinc-500" />
                  <SelectValue placeholder="Time filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="thisWeek">This week</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <Filter className="w-4 h-4 mr-2 text-zinc-500" />
                  <SelectValue placeholder="Status filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="rounded-md border border-zinc-800 overflow-hidden">
          <Table>
            <TableCaption>Your file renaming history</TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-zinc-900 bg-zinc-950">
                <TableHead className="w-[250px] cursor-pointer" onClick={() => toggleSortDirection('originalName')}>
                  <div className="flex items-center">
                    Original Filename
                    {sortBy === 'originalName' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="w-3 h-3 ml-1" /> : 
                        <ArrowDown className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[250px] cursor-pointer" onClick={() => toggleSortDirection('newName')}>
                  <div className="flex items-center">
                    New Filename
                    {sortBy === 'newName' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="w-3 h-3 ml-1" /> : 
                        <ArrowDown className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[150px] cursor-pointer" onClick={() => toggleSortDirection('timestamp')}>
                  <div className="flex items-center">
                    Date
                    {sortBy === 'timestamp' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="w-3 h-3 ml-1" /> : 
                        <ArrowDown className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px] cursor-pointer" onClick={() => toggleSortDirection('size')}>
                  <div className="flex items-center">
                    Size
                    {sortBy === 'size' && (
                      sortDirection === 'asc' ? 
                        <ArrowUp className="w-3 h-3 ml-1" /> : 
                        <ArrowDown className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedEntries.length > 0 ? (
                filteredAndSortedEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-zinc-900">
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[200px]" title={entry.originalName}>
                        {entry.originalName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="truncate max-w-[200px]" title={entry.newName}>
                        {entry.newName}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {entry.status === 'success' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Failed
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatFileSize(entry.size)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDownload(entry)}>
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download</span>
                          </DropdownMenuItem>
                          {entry.status === 'failed' && (
                            <DropdownMenuItem onClick={() => handleReprocess(entry.id)}>
                              <Repeat className="mr-2 h-4 w-4" />
                              <span>Reprocess</span>
                            </DropdownMenuItem>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this history entry.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(entry.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-400">No file history entries found</p>
                    {searchTerm || timeFilter !== 'all' || statusFilter !== 'all' ? (
                      <p className="text-sm text-zinc-500 mt-1">
                        Try adjusting your filters
                      </p>
                    ) : (
                      <p className="text-sm text-zinc-500 mt-1">
                        Rename files to see your history here
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FileHistorySection;