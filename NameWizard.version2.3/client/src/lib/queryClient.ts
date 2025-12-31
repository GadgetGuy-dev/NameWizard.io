import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public url: string;
  public body?: any;

  constructor(res: Response, body?: any) {
    super(`API Error: ${res.status} ${res.statusText}`);
    this.name = 'ApiError';
    this.status = res.status;
    this.statusText = res.statusText;
    this.url = res.url;
    this.body = body;
  }
}

/**
 * Makes an API request with proper error handling
 */
export async function apiRequest(
  method: HttpMethod,
  endpoint: string,
  data?: any,
  options: RequestInit = {}
): Promise<Response> {
  // Make sure endpoint starts with /api/
  if (!endpoint.startsWith('/api/')) {
    endpoint = `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  // Set up request configuration
  const config: RequestInit = {
    method,
    headers: {
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  // Add body for non-GET requests
  if (method !== 'GET' && data) {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    };
    config.body = JSON.stringify(data);
  }

  // Make the request
  const response = await fetch(endpoint, config);

  // Handle errors
  if (!response.ok) {
    let errorBody;
    try {
      errorBody = await response.json();
    } catch (e) {
      // If we can't parse the error response, just use the status text
      errorBody = { message: response.statusText };
    }
    throw new ApiError(response, errorBody);
  }

  return response;
}

/**
 * Creates a query function for use with react-query
 */
export function getQueryFn<T = unknown>(options: { on401?: 'throw' | 'returnNull' } = {}) {
  const { on401 = 'throw' } = options;
  
  return async ({ queryKey }: { queryKey: readonly unknown[] }): Promise<T | null> => {
    const endpoint = queryKey[0] as string;
    
    try {
      const response = await apiRequest('GET', endpoint);
      
      // For endpoints returning no content
      if (response.status === 204) {
        return null;
      }
      
      // Parse response as JSON
      return await response.json();
    } catch (error) {
      // Handle 401 unauthorized errors
      if (error instanceof ApiError && error.status === 401) {
        if (on401 === 'returnNull') {
          return null;
        }
      }
      throw error;
    }
  };
}

// Set the default query function for all queries
queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
    queryFn: getQueryFn(),
  },
});