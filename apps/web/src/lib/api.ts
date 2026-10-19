const API_BASE = '/api/v1';

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  let data: any = null;
  try {
    data = isJson ? await res.json() : null;
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    let errorMsg = 'An error occurred. Please try again.';
    if (typeof data?.error === 'string') {
      errorMsg = data.error;
    } else if (typeof data?.message === 'string') {
      errorMsg = data.message;
    } else if (data?.details && Array.isArray(data.details)) {
      errorMsg = data.details.map((d: any) => typeof d === 'string' ? d : d.message || JSON.stringify(d)).join(', ');
    } else if (typeof data?.error === 'object' && data.error !== null) {
      errorMsg = data.error.message || JSON.stringify(data.error);
    } else if (typeof data === 'string') {
      errorMsg = data;
    } else {
      errorMsg = `Request failed with status ${res.status}`;
    }
    throw new ApiError(errorMsg, res.status, data?.code, data?.details);
  }

  return data as T;
}

export const api = {
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = `${API_BASE}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    return handleResponse<T>(res);
  },

  async post<T>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    return handleResponse<T>(res);
  },

  async put<T>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    return handleResponse<T>(res);
  },

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    return handleResponse<T>(res);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    return handleResponse<T>(res);
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });

    return handleResponse<T>(res);
  }
};
