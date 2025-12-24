
const API_URL = 'https://sua-api.seu-dominio.com'; // URL que você configurará no Easypanel

export const api = {
  async request(endpoint: string, method = 'GET', body?: any) {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.reload();
      throw new Error('Sessão expirada');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro na requisição');
    }

    return response.json();
  },

  get: (endpoint: string) => api.request(endpoint, 'GET'),
  post: (endpoint: string, body: any) => api.request(endpoint, 'POST', body),
  put: (endpoint: string, body: any) => api.request(endpoint, 'PUT', body),
  delete: (endpoint: string) => api.request(endpoint, 'DELETE'),
};
