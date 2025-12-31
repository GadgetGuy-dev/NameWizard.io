import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  FileCog, 
  FileDigit, 
  FileBadge, 
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";

// Types
import type { Agent } from "./AgentManagement";

// Performance dashboard props
interface AgentPerformanceDashboardProps {
  selectedAgentId?: number;
}

// Helper function to get agent type icon
function AgentTypeIcon({ type }: { type: Agent['type'] }) {
  switch (type) {
    case 'file_organizer':
      return <FileCog className="h-5 w-5" />;
    case 'content_analyzer':
      return <FileDigit className="h-5 w-5" />;
    case 'batch_processor':
      return <FileBadge className="h-5 w-5" />;
    case 'custom':
      return <FileCheck className="h-5 w-5" />;
  }
}

// Helper function to get human readable agent type
function getAgentTypeLabel(type: Agent['type']) {
  switch (type) {
    case 'file_organizer':
      return 'File Organizer';
    case 'content_analyzer':
      return 'Content Analyzer';
    case 'batch_processor':
      return 'Batch Processor';
    case 'custom':
      return 'Custom Agent';
  }
}

// Main dashboard component
export default function AgentPerformanceDashboard({ selectedAgentId }: AgentPerformanceDashboardProps) {
  // Fetch all agents
  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });
  
  // Filter agents if a specific ID is selected
  const displayedAgents = selectedAgentId 
    ? agents.filter(agent => agent.id === selectedAgentId)
    : agents;
  
  // Summary statistics
  const totalAgents = displayedAgents.length;
  const completedAgents = displayedAgents.filter(agent => agent.status === 'completed').length;
  const failedAgents = displayedAgents.filter(agent => agent.status === 'failed').length;
  const runningAgents = displayedAgents.filter(agent => agent.status === 'running').length;
  
  // Agents by type data
  const agentsByType = displayedAgents.reduce((acc, agent) => {
    acc[agent.type] = (acc[agent.type] || 0) + 1;
    return acc;
  }, {} as Record<Agent['type'], number>);
  
  const agentTypeData = Object.entries(agentsByType).map(([type, count]) => ({
    name: getAgentTypeLabel(type as Agent['type']),
    value: count
  }));
  
  // Agent status data
  const statusData = [
    { name: 'Completed', value: completedAgents },
    { name: 'Failed', value: failedAgents },
    { name: 'Running', value: runningAgents },
    { name: 'Idle', value: totalAgents - completedAgents - failedAgents - runningAgents }
  ];
  
  // Success rate over time (simulated data)
  const successRateData = [
    { name: 'Mon', rate: 95 },
    { name: 'Tue', rate: 85 },
    { name: 'Wed', rate: 90 },
    { name: 'Thu', rate: 92 },
    { name: 'Fri', rate: 88 },
    { name: 'Sat', rate: 94 },
    { name: 'Sun', rate: 97 }
  ];
  
  // Colors for pie chart
  const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#94a3b8'];
  
  // Recent agent runs (if a specific agent is selected)
  const recentRuns = selectedAgentId ? [
    { date: '2025-03-30T09:15:00', status: 'completed', duration: '1m 23s', files: 12 },
    { date: '2025-03-29T14:22:00', status: 'completed', duration: '2m 05s', files: 18 },
    { date: '2025-03-28T11:30:00', status: 'failed', duration: '0m 45s', files: 5 },
    { date: '2025-03-27T16:45:00', status: 'completed', duration: '1m 10s', files: 10 }
  ] : [];
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Agent Performance Dashboard</h2>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
                <h3 className="text-2xl font-bold mt-1">{totalAgents}</h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Completed Runs</p>
                <h3 className="text-2xl font-bold mt-1">{completedAgents}</h3>
              </div>
              <div className="p-2 bg-green-500/10 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Failed Runs</p>
                <h3 className="text-2xl font-bold mt-1">{failedAgents}</h3>
              </div>
              <div className="p-2 bg-red-500/10 rounded-full">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Running Now</p>
                <h3 className="text-2xl font-bold mt-1">{runningAgents}</h3>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Status Distribution</CardTitle>
            <CardDescription>Current status of all your agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Agent Success Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Success Rate Over Time</CardTitle>
            <CardDescription>Weekly trend of successful agent runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={successRateData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
                  <Bar dataKey="rate" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Agent type breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agent Type Distribution</CardTitle>
          <CardDescription>Breakdown of your agents by type</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(agentsByType).map(([type, count]) => {
              const typedType = type as Agent['type'];
              const percentage = Math.round((count / totalAgents) * 100);
              
              return (
                <div key={type} className="p-3 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-primary/10 rounded-md">
                        <AgentTypeIcon type={typedType} />
                      </div>
                      <span className="font-medium text-sm">{getAgentTypeLabel(typedType)}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-1 mb-1" />
                  <p className="text-xs text-muted-foreground text-right">{percentage}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent runs for a specific agent */}
      {selectedAgentId && recentRuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Agent Runs</CardTitle>
            <CardDescription>History of recent executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRuns.map((run, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${
                      run.status === 'completed' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {run.status === 'completed' 
                        ? <CheckCircle className="h-4 w-4 text-green-500" /> 
                        : <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(run.date).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Processed {run.files} files in {run.duration}
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={run.status === 'completed' ? 'outline' : 'destructive'}
                    className="ml-auto"
                  >
                    {run.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}