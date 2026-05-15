const API_URL = ''; // Relative path for the same-origin server

export const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('mktai_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('API request failed');
    return res.json();
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
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'API request failed');
    }
    return res.json();
  },
  delete: async (endpoint: string) => {
    const token = localStorage.getItem('mktai_token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('API request failed');
    return res;
  }
};
