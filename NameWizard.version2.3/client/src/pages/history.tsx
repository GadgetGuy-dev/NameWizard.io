import { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Clock, FileText, RefreshCw, Download, Trash2, Search, Filter, Calendar, CheckCircle, XCircle, Undo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface HistoryEntry {
  id: string;
  timestamp: Date;
  operation: 'rename' | 'batch_rename' | 'ocr_rename' | 'magic_folder';
  filesCount: number;
  status: 'success' | 'partial' | 'failed';
  details: {
    originalNames: string[];
    newNames: string[];
    errors?: string[];
  };
}

const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3600000),
    operation: 'ocr_rename',
    filesCount: 5,
    status: 'success',
    details: {
      originalNames: ['IMG_001.png', 'IMG_002.png', 'IMG_003.png', 'IMG_004.png', 'IMG_005.png'],
      newNames: ['Invoice_2025-01-15.png', 'Contract_Smith.png', 'Receipt_Amazon.png', 'Tax_Form_2024.png', 'ID_Scan_Front.png']
    }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 7200000),
    operation: 'batch_rename',
    filesCount: 12,
    status: 'success',
    details: {
      originalNames: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
      newNames: ['vacation_001.jpg', 'vacation_002.jpg', 'vacation_003.jpg']
    }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 86400000),
    operation: 'magic_folder',
    filesCount: 23,
    status: 'partial',
    details: {
      originalNames: ['mixed_files.zip'],
      newNames: ['Documents/reports/', 'Images/photos/', 'Videos/clips/'],
      errors: ['2 files could not be categorized']
    }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 172800000),
    operation: 'rename',
    filesCount: 1,
    status: 'success',
    details: {
      originalNames: ['untitled.pdf'],
      newNames: ['Project_Proposal_Final.pdf']
    }
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 259200000),
    operation: 'ocr_rename',
    filesCount: 3,
    status: 'failed',
    details: {
      originalNames: ['scan1.jpg', 'scan2.jpg', 'scan3.jpg'],
      newNames: [],
      errors: ['OCR processing failed: Invalid image format']
    }
  }
];

const HistoryPage = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperation, setFilterOperation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getOperationLabel = (op: string) => {
    const labels: Record<string, string> = {
      'rename': 'Single Rename',
      'batch_rename': 'Batch Rename',
      'ocr_rename': 'OCR Rename',
      'magic_folder': 'Magic Folder'
    };
    return labels[op] || op;
  };

  const getOperationColor = (op: string) => {
    const colors: Record<string, string> = {
      'rename': 'bg-blue-600',
      'batch_rename': 'bg-purple-600',
      'ocr_rename': 'bg-orange-600',
      'magic_folder': 'bg-green-600'
    };
    return colors[op] || 'bg-zinc-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-600"><RefreshCw className="h-3 w-3 mr-1" />Partial</Badge>;
      case 'failed':
        return <Badge className="bg-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleUndo = (id: string) => {
    const entry = history.find(h => h.id === id);
    if (!entry) return;
    
    toast({
      title: "Undo operation",
      description: `Reverting ${entry.filesCount} file(s) to original names...`
    });

    setTimeout(() => {
      setHistory(prev => prev.filter(h => h.id !== id));
      toast({
        title: "Undo complete",
        description: "Files reverted to original names"
      });
    }, 1000);
  };

  const handleDelete = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    toast({ title: "History entry removed" });
  };

  const handleClearAll = () => {
    setHistory([]);
    toast({ title: "History cleared" });
  };

  const handleExport = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `namewizard_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "History exported" });
  };

  const filteredHistory = history.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.details.originalNames.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.details.newNames.some(n => n.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesOperation = filterOperation === 'all' || entry.operation === filterOperation;
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesOperation && matchesStatus;
  });

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
              <Clock className="h-5 w-5 mr-2" /> File Rename History
            </h1>
            <p className="text-zinc-400 mt-1">Track all your file renaming operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-zinc-700" onClick={handleExport} data-testid="export-history">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button variant="outline" className="border-red-700 text-red-400" onClick={handleClearAll} data-testid="clear-history">
              <Trash2 className="h-4 w-4 mr-2" /> Clear All
            </Button>
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search files..."
                    className="pl-10 bg-zinc-800 border-zinc-700"
                    data-testid="search-input"
                  />
                </div>
              </div>
              <Select value={filterOperation} onValueChange={setFilterOperation}>
                <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Operation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operations</SelectItem>
                  <SelectItem value="rename">Single Rename</SelectItem>
                  <SelectItem value="batch_rename">Batch Rename</SelectItem>
                  <SelectItem value="ocr_rename">OCR Rename</SelectItem>
                  <SelectItem value="magic_folder">Magic Folder</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px] bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-lg font-medium mb-2">No history found</h3>
                <p className="text-zinc-400">
                  {history.length === 0 ? 'Your file renaming history will appear here' : 'No entries match your filters'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredHistory.map(entry => (
              <Card key={entry.id} className="bg-zinc-900 border-zinc-800" data-testid={`history-entry-${entry.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getOperationColor(entry.operation)}>
                          {getOperationLabel(entry.operation)}
                        </Badge>
                        {getStatusBadge(entry.status)}
                        <span className="text-zinc-500 text-sm flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(entry.timestamp)}
                        </span>
                        <span className="text-zinc-500 text-sm">
                          {entry.filesCount} file{entry.filesCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-xs text-zinc-500 uppercase mb-2">Original Names</h4>
                          <div className="space-y-1">
                            {entry.details.originalNames.slice(0, 3).map((name, i) => (
                              <div key={i} className="text-sm text-zinc-400 font-mono truncate">
                                {name}
                              </div>
                            ))}
                            {entry.details.originalNames.length > 3 && (
                              <div className="text-xs text-zinc-500">
                                +{entry.details.originalNames.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs text-zinc-500 uppercase mb-2">New Names</h4>
                          <div className="space-y-1">
                            {entry.details.newNames.slice(0, 3).map((name, i) => (
                              <div key={i} className="text-sm text-orange-400 font-mono truncate">
                                {name}
                              </div>
                            ))}
                            {entry.details.newNames.length > 3 && (
                              <div className="text-xs text-zinc-500">
                                +{entry.details.newNames.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {entry.details.errors && entry.details.errors.length > 0 && (
                        <div className="mt-3 p-2 bg-red-900/20 rounded border border-red-800">
                          <p className="text-sm text-red-400">{entry.details.errors[0]}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-zinc-700"
                        onClick={() => handleUndo(entry.id)}
                        disabled={entry.status === 'failed'}
                        data-testid={`undo-${entry.id}`}
                      >
                        <Undo className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-700 text-red-400"
                        onClick={() => handleDelete(entry.id)}
                        data-testid={`delete-${entry.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="text-center text-zinc-500 text-sm">
          Showing {filteredHistory.length} of {history.length} entries
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
