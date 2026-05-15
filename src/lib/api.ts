const API_URL = ''; // Relative path for the same-origin server

export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('mktai_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
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
    return res;
  },
  post: async (endpoint: string, data: any) => {
    const token = localStorage.getItem('mktai_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
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
    const res = await fetch(`${API_URL}${endpoint}`, {
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
