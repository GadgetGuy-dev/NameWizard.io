import { apiRequest, ApiError, getQueryFn } from './queryClient';

// Mock global fetch
global.fetch = jest.fn();

// Mock performance.now for consistent timing in tests
let mockTime = 0;
global.performance.now = jest.fn(() => {
  mockTime += 100;
  return mockTime;
});

describe('API Request Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0;
  });

  describe('apiRequest', () => {
    test('should make a GET request with correct options', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ data: 'test data' }),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the function
      const result = await apiRequest({ url: '/api/test' });
      
      // Assertions
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {},
        credentials: 'include',
      });
      
      expect(result).toEqual({ data: 'test data' });
    });
    
    test('should handle 401 unauthorized with returnNull option', async () => {
      // Setup mock response
      const mockResponse = {
        ok: false,
        status: 401,
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the function
      const result = await apiRequest({ url: '/api/test', on401: 'returnNull' });
      
      // Assertions
      expect(result).toBeNull();
    });
    
    test('should throw ApiError for non-OK responses', async () => {
      // Setup mock response
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({ message: 'Server error occurred' }),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the function and expect it to throw
      await expect(apiRequest({ url: '/api/test' }))
        .rejects
        .toThrow('Server error occurred');
    });
    
    test('should add cache control headers for GET requests with noCache option', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({}),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call the function
      await apiRequest({ url: '/api/test', method: 'GET', noCache: true });
      
      // Assertions
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        credentials: 'include',
      });
    });
    
    test('should handle network errors', async () => {
      // Setup mock response
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      // Call the function and expect it to throw
      await expect(apiRequest({ url: '/api/test' }))
        .rejects
        .toThrow('Network error');
    });
  });
  
  describe('getQueryFn', () => {
    test('should return a function that calls apiRequest with the correct URL', async () => {
      // Setup mock response
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: jest.fn().mockResolvedValue({ data: 'test data' }),
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Create query function
      const queryFn = getQueryFn();
      
      // Call the function
      const result = await queryFn({ queryKey: ['/api/test'] });
      
      // Assertions
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {},
        credentials: 'include',
      });
      
      expect(result).toEqual({ data: 'test data' });
    });
  });
});