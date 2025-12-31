import { ApiKey, CloudConnection } from './ApiKeyManager';

// Mock API keys for testing
export const mockApiKeys: ApiKey[] = [
  {
    id: 1,
    userId: 1,
    llmType: 'openai',
    key: 'sk-openaimock123456789012345678901234567890123456789012',
    status: 'inactive',
    lastUsed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: false,
    capabilities: ['Text', 'Vision', 'Code'],
    lastTestResult: {
      success: false,
      message: 'API key is invalid or expired',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 2,
    userId: 1,
    llmType: 'anthropic',
    key: 'sk-ant-api03-mockanthropicd5OXwfjf02-AbC123DEf456gHI7890',
    status: 'inactive',
    lastUsed: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: false,
    capabilities: ['Text', 'Vision', 'Analysis'],
    lastTestResult: {
      success: false,
      message: 'Authentication failed - check API key format',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 3,
    userId: 1,
    llmType: 'meta',
    key: 'META_API_KEY_1234567890abcdefghijklmnop',
    status: 'inactive',
    lastUsed: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: false,
    capabilities: ['Text', 'Code'],
    lastTestResult: {
      success: false,
      message: 'Service unavailable - try again later',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 4,
    userId: 1,
    llmType: 'google',
    key: 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
    status: 'inactive',
    lastUsed: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: false,
    capabilities: ['Text', 'Vision', 'Search'],
    lastTestResult: {
      success: false,
      message: 'Quota exceeded - upgrade plan or wait',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 5,
    userId: 1,
    llmType: 'dropbox',
    key: 'sl.B1234567890abcdefghijklmnopqrstuvwxyz',
    status: 'inactive',
    lastUsed: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: false,
    capabilities: ['Storage', 'Sync'],
    lastTestResult: {
      success: false,
      message: 'Connection timeout - check network',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 6,
    userId: 1,
    llmType: 'googledrive',
    key: 'ya29.a0AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
    status: 'inactive',
    lastUsed: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: false,
    capabilities: ['Storage', 'Docs', 'Sheets'],
    lastTestResult: {
      success: false,
      message: 'Token expired - re-authenticate required',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 7,
    userId: 1,
    llmType: 'mistral',
    key: 'MISTRAL_API_KEY_abcdefghijklmnopqrstuvwxyz',
    status: 'inactive',
    lastUsed: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: false,
    capabilities: ['Text', 'Multilingual'],
    lastTestResult: {
      success: false,
      message: 'Invalid API key format - check documentation',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 8,
    userId: 1,
    llmType: 'perplexity',
    key: 'pplx-abcdefghijklmnopqrstuvwxyz1234567890',
    status: 'inactive',
    lastUsed: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: false,
    capabilities: ['Search', 'Real-time'],
    lastTestResult: {
      success: false,
      message: 'Rate limit exceeded - wait before retrying',
      timestamp: new Date().toISOString()
    }
  }
];

// Mock cloud connections for testing
export const mockCloudConnections: CloudConnection[] = [
  {
    id: 1,
    userId: 1,
    provider: 'dropbox',
    accessToken: 'dropbox_mock_access_token_12345678901234567890',
    refreshToken: 'dropbox_mock_refresh_token_12345678901234567890',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];