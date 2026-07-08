import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';

describe('useAuthStore login', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      validationErrors: {},
    });
    vi.restoreAllMocks();
  });

  it('sends login credentials as form data and stores the backend token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        success: true,
        data: {
          user: { id: 1, name: 'Admin User', email: 'admin@gmail.com' },
          token: 'backend-token',
        },
      }),
    });

    vi.stubGlobal('fetch', fetchMock);

    await useAuthStore.getState().login({ email: 'admin@gmail.com', password: 'admin123' });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/login');
    expect(options?.method).toBe('POST');
    expect(options?.body).toContain('email=admin%40gmail.com');
    expect(options?.body).toContain('password=admin123');
    expect(options?.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
    expect(useAuthStore.getState().token).toBe('backend-token');
    expect(localStorage.getItem('kupat_token')).toBe('backend-token');
  });
});
