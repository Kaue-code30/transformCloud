const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function humanizeError(status: number, rawMessage: unknown): string {
  // class-validator retorna array de strings
  if (Array.isArray(rawMessage) && rawMessage.length > 0) {
    return String(rawMessage[0]);
  }

  const msg = typeof rawMessage === 'string' ? rawMessage.toLowerCase() : '';

  // Mensagens conhecidas do backend — traduzir para PT-BR claro
  if (msg.includes('senha atual incorreta') || msg.includes('invalid credentials') || msg.includes('credenciais inválidas')) {
    return 'Senha atual incorreta. Verifique e tente novamente.';
  }
  if (msg.includes('unauthorized') || status === 401) {
    return 'Sessão expirada. Faça login novamente.';
  }
  if (msg.includes('e-mail já cadastrado') || msg.includes('conflict') || status === 409) {
    return 'Este e-mail já está em uso.';
  }
  if (msg.includes('not found') || status === 404) {
    return 'Recurso não encontrado.';
  }
  if (status === 400) {
    return typeof rawMessage === 'string' && rawMessage.length > 0
      ? rawMessage
      : 'Dados inválidos. Verifique os campos e tente novamente.';
  }
  if (status >= 500) {
    return 'Erro no servidor. Tente novamente em alguns instantes.';
  }

  return typeof rawMessage === 'string' && rawMessage.length > 0
    ? rawMessage
    : `Erro inesperado (${status}).`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  const { headers: extraHeaders, ...rest } = options;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
    });
  } catch {
    throw new Error('Sem conexão. Verifique sua internet e tente novamente.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(humanizeError(res.status, body?.message));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function authHeader(): { Authorization: string } | Record<string, never> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  auth: {
    register: (data: { email: string; name: string; password: string }) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    logout: (refreshToken: string) =>
      request<void>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),

    forgotPassword: (email: string) =>
      request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    resetPassword: (token: string, newPassword: string) =>
      request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }),
  },

  users: {
    me: () =>
      request<{ id: string; email: string; name: string; role: string; createdAt: string }>('/users/me', {
        headers: authHeader(),
      }),

    update: (data: { name?: string }) =>
      request<{ id: string; email: string; name: string; role: string; createdAt: string }>('/users/me', {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(data),
      }),

    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ message: string }>('/users/me/password', {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },
};
