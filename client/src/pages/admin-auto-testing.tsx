import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Play, Trash2, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface TestRun {
  id: number;
  testName: string;
  testType: string;
  status: string;
  duration?: number;
  results?: Record<string, unknown>;
  errorMessage?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface TestType {
  id: string;
  name: string;
  description: string;
}

const AdminAutoTesting = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  const { data: testTypes = [] } = useQuery<TestType[]>({
    queryKey: ['/api/tests/types']
  });

  const { data: testRuns = [], isLoading } = useQuery<TestRun[]>({
    queryKey: ['/api/tests']
  });

  const runTestMutation = useMutation({
    mutationFn: async (testType: string) => {
      const res = await apiRequest('POST', '/api/tests', { testType });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      toast({ 
        title: data.status === 'passed' ? "Test passed" : "Test completed",
        description: data.testName,
        variant: data.status === 'failed' ? "destructive" : "default"
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to run test", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/tests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tests'] });
      toast({ title: "Test run deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete test run", variant: "destructive" });
    }
  });

  const runTest = async (testType: string) => {
    setRunningTests(prev => new Set(prev).add(testType));
    try {
      await runTestMutation.mutateAsync(testType);
    } finally {
      setRunningTests(prev => {
        const next = new Set(prev);
        next.delete(testType);
        return next;
      });
    }
  };

  const runAllTests = async () => {
    const typesToRun = testTypes.filter(t => t.id !== 'all');
    for (const testType of typesToRun) {
      await runTest(testType.id);
    }
    toast({ title: "All tests complete" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" /> Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      case 'running':
        return <Badge className="bg-orange-500/20 text-orange-400"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running</Badge>;
      default:
        return <Badge className="bg-zinc-500/20 text-zinc-400"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-orange-500">Auto Testing</h1>
            <p className="text-zinc-400">Run automated tests on your system configuration</p>
          </div>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={runningTests.size > 0}
          className="bg-orange-500 hover:bg-orange-600"
          data-testid="button-run-all-tests"
        >
          <Play className={`w-4 h-4 mr-2 ${runningTests.size > 0 ? 'animate-pulse' : ''}`} />
          Run All Tests
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-zinc-400 hover:text-orange-400 hover:bg-zinc-800"
          data-testid="button-close-page"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-400">Available Tests</CardTitle>
            <CardDescription>Run individual tests to verify system components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {testTypes.map(test => (
              <div 
                key={test.id} 
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 flex items-center justify-between"
                data-testid={`test-type-${test.id}`}
              >
                <div>
                  <div className="font-medium text-orange-200">{test.name}</div>
                  <div className="text-xs text-zinc-500">{test.description}</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => runTest(test.id)}
                  disabled={runningTests.has(test.id)}
                  className="border-orange-500 text-orange-400"
                  data-testid={`button-run-${test.id}`}
                >
                  {runningTests.has(test.id) ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" /> Run
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-400">Test History</CardTitle>
            <CardDescription>Recent test results from the database</CardDescription>
          </CardHeader>
          <CardContent>
            {testRuns.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No test runs yet. Run a test to get started.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {testRuns.map(run => (
                  <div 
                    key={run.id} 
                    className="flex items-start justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700"
                    data-testid={`result-row-${run.id}`}
                  >
                    <div className="flex items-start gap-3">
                      {run.status === 'passed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : run.status === 'failed' ? (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      ) : (
                        <Clock className="w-5 h-5 text-zinc-500 mt-0.5" />
                      )}
                      <div>
                        <div className="font-medium text-orange-200 text-sm">{run.testName}</div>
                        <div className="text-xs text-zinc-500">
                          {run.errorMessage || `Type: ${run.testType}`}
                        </div>
                        {run.duration && (
                          <div className="text-xs text-zinc-600">{run.duration}ms</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs text-zinc-400">
                          {new Date(run.createdAt).toLocaleTimeString()}
                        </div>
                        {getStatusBadge(run.status)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(run.id)}
                        className="text-zinc-500 hover:text-red-400"
                        data-testid={`button-delete-${run.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAutoTesting;
