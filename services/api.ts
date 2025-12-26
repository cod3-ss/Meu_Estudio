
// O Vite usará o proxy configurado em vite.config.ts para redirecionar /api para o backend real.
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = {
  async request(endpoint: string, method = 'GET', body?: any) {
    const token = localStorage.getItem('auth_token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Sessão expirada');
      }

      if (!response.ok) {
        // Retornamos um erro estruturado que pode ser capturado silenciosamente
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || `Erro ${response.status}: Falha na requisição`;
        throw new Error(errorMsg);
      }

      return response.json();
    } catch (error) {
      // Removido o console.error agressivo para que o AppContext decida como logar falhas de conexão
      throw error;
    }
  },

  get: (endpoint: string) => api.request(endpoint, 'GET'),
  post: (endpoint: string, body: any) => api.request(endpoint, 'POST', body),
  put: (endpoint: string, body: any) => api.request(endpoint, 'PUT', body),
  delete: (endpoint: string) => api.request(endpoint, 'DELETE'),
};
