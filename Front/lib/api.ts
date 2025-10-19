// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function isJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  return contentType ? contentType.includes('application/json') : false;
}

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const payload = isJsonResponse(res) ? await res.json().catch(() => ({})) : {};

    if (!res.ok) {
      throw new ApiError((payload as { message?: string }).message ?? `Erro ${res.status}`, res.status, payload);
    }

    return payload;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.', 0);
  }
}
