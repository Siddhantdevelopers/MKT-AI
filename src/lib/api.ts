const API_URL = '/api'; // Prefix for all API calls

export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('mktai_token');
    const fullUrl = endpoint.startsWith('/api') ? endpoint : `${API_URL}${endpoint}`;
    console.log(`DEBUG: API GET ${fullUrl}`);
    const res = await fetch(fullUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      if (contentType && contentType.includes('application/json')) {
        const err = await res.json();
        throw new Error(err.error || 'API request failed');
      }
      throw new Error(`API request failed with status ${res.status}`);
    }

    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    throw new Error('API returned non-JSON response');
  },
  post: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('mktai_token');
    const fullUrl = endpoint.startsWith('/api') ? endpoint : `${API_URL}${endpoint}`;
    console.log(`DEBUG: API POST ${fullUrl}`);
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      if (contentType && contentType.includes('application/json')) {
        const err = await res.json();
        throw new Error(err.error || 'API request failed');
      }
      throw new Error(`API request failed with status ${res.status}`);
    }
    
    if (contentType && contentType.includes('application/json')) {
      return res.json();
    }
    return res;
  },
  delete: async (endpoint: string) => {
    const token = localStorage.getItem('mktai_token');
    const fullUrl = endpoint.startsWith('/api') ? endpoint : `${API_URL}${endpoint}`;
    console.log(`DEBUG: API DELETE ${fullUrl}`);
    const res = await fetch(fullUrl, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      if (contentType && contentType.includes('application/json')) {
        const err = await res.json();
        throw new Error(err.error || 'API request failed');
      }
      throw new Error(`API request failed with status ${res.status}`);
    }
    return res;
  }
};
