import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, TestTube, Trash2, Edit2, Save, X } from 'lucide-react';
import { ApiKey } from './ApiKeyManager';

interface ApiKeyRowProps {
  apiKey: ApiKey;
  showKey: boolean;
  onToggleVisibility: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onTest: () => void;
  onDelete: () => void;
  onUpdate: (updatedKey: Partial<ApiKey>) => void;
}

export function ApiKeyRow({
  apiKey,
  showKey,
  onToggleVisibility,
  onToggleEnabled,
  onTest,
  onDelete,
  onUpdate
}: ApiKeyRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedKey, setEditedKey] = useState(apiKey.key);

  const handleSave = () => {
    onUpdate({ key: editedKey, updatedAt: new Date().toISOString() });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedKey(apiKey.key);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getCapabilityBadges = (capabilities: string[]) => {
    const colorMap: Record<string, string> = {
      'Text Generation': 'bg-blue-600',
      'Vision': 'bg-purple-600', 
      'Image Generation': 'bg-pink-600',
      'Audio/Voice': 'bg-green-600',
      'Code Generation': 'bg-orange-600',
      'Embeddings': 'bg-cyan-600',
      'Reasoning': 'bg-indigo-600'
    };

    return capabilities.map((cap) => (
      <Badge key={cap} className={`${colorMap[cap] || 'bg-gray-600'} text-white text-xs`}>
        {cap}
      </Badge>
    ));
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(apiKey.status)}`}></div>
          <h3 className="text-white font-medium">{apiKey.llmType}</h3>
          <div className="flex items-center space-x-1">
            {getCapabilityBadges(apiKey.capabilities)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={apiKey.enabled}
            onCheckedChange={onToggleEnabled}
            className="data-[state=checked]:bg-orange-600"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={onTest}
            disabled={!apiKey.enabled}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <TestTube className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="border-red-600 text-red-400 hover:bg-red-600/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <div className="flex-1 flex items-center space-x-2">
              <Input
                value={editedKey}
                onChange={(e) => setEditedKey(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter your API key"
              />
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex items-center space-x-2">
              <Input
                value={showKey ? apiKey.key : '•'.repeat(Math.min(apiKey.key.length, 32))}
                readOnly
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleVisibility}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {apiKey.lastTestResult && (
          <div className={`text-sm p-2 rounded ${
            apiKey.lastTestResult.success 
              ? 'bg-green-900/20 text-green-400' 
              : 'bg-red-900/20 text-red-400'
          }`}>
            <div className="font-medium">
              {apiKey.lastTestResult.success ? 'Test Successful' : 'Test Failed'}
            </div>
            <div className="text-xs opacity-80">
              {apiKey.lastTestResult.message}
            </div>
            <div className="text-xs opacity-60 mt-1">
              {new Date(apiKey.lastTestResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-400 space-y-1">
          <div>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</div>
          {apiKey.lastUsed && (
            <div>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</div>
          )}
        </div>
      </div>
    </div>
  );
}