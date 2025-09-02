// API utilities with automatic token refresh and error handling
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async handleResponse(response: Response) {
        if (response.status === 401) {
            // Token expired or invalid - clear localStorage and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth/login';
            }
            throw new Error('Token expired. Redirecting to login...');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
    }

    async get(endpoint: string, options: RequestInit = {}) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers,
            ...options,
        });

        await this.handleResponse(response);
        return response.json();
    }

    async post(endpoint: string, data?: any, options: RequestInit = {}) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers,
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });

        await this.handleResponse(response);
        return response.json();
    }

    async put(endpoint: string, data?: any, options: RequestInit = {}) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: data ? JSON.stringify(data) : undefined,
            ...options,
        });

        await this.handleResponse(response);
        return response.json();
    }

    async delete(endpoint: string, options: RequestInit = {}) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers,
            ...options,
        });

        await this.handleResponse(response);
        return response.json();
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Legacy fetch wrapper for backward compatibility
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Token expired - clear localStorage and redirect
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }
        throw new Error('Token expired. Redirecting to login...');
    }

    return response;
}
