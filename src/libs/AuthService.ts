import { Env } from './Env';

const API_URL = Env.NEXT_PUBLIC_API_URL;

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private setCookie(name: string, value: string, maxAge: number) {
    if (typeof document === 'undefined') return;
    const isProd = process.env.NODE_ENV === 'production';
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${isProd ? '; Secure' : ''}`;
  }

  private deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  }

  async signup(data: any): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  }

  async login(data: any): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      this.clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return response.json();
  }

  async updateProfile(data: { name: string }): Promise<void> {
    const token = this.getAccessToken();
    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    // 2 hours for access token, 7 days for refresh token
    this.setCookie('accessToken', accessToken, 2 * 3600);
    this.setCookie('refreshToken', refreshToken, 7 * 24 * 3600);
  }

  getAccessToken() {
    return this.getCookie('accessToken');
  }

  getRefreshToken() {
    return this.getCookie('refreshToken');
  }

  clearTokens() {
    this.deleteCookie('accessToken');
    this.deleteCookie('refreshToken');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export default new AuthService();
