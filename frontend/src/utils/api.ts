// API utilities with automatic token refresh and error handling
const getApiUrl = () => {
    // Check if we're in production
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'rialtor.app' || hostname === 'www.rialtor.app') {
            // point to backend host (no trailing /api)
            return 'https://remax-be-production.up.railway.app';
        }
    }
    // Fallback to environment variable or localhost (expect full host without /api)
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
};

const API_BASE_URL = getApiUrl();

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async handleResponse(response: Response) {
        if (response.status === 401) {
            // Don't redirect for calendar API errors - handle them gracefully
            if (response.url.includes('/api/calendar/')) {
                throw new Error('CALENDAR_NOT_CONNECTED');
            }

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

    // Don't set Content-Type for FormData - let browser set it with boundary
    const isFormData = options.body instanceof FormData;
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Build full URL if relative
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Don't redirect for calendar API errors - handle them gracefully
        if (fullUrl.includes('/api/calendar/')) {
            throw new Error('CALENDAR_NOT_CONNECTED');
        }

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

// Helper to safely parse JSON bodies without throwing when body is empty or invalid JSON
export async function safeJson(response: Response) {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return null;
    }
}

// Convenience wrapper that performs authenticated fetch and parses JSON, throwing on non-ok responses
export async function authenticatedFetchJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await authenticatedFetch(url, options);
    const data = await safeJson(response);

    if (!response.ok) {
        const message = (data && (data.message || data.error)) || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
    }

    return data as T;
}

// Public fetch wrapper for routes that don't require authentication
export async function publicFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };

    // Build full URL if relative
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const response = await fetch(fullUrl, {
        ...options,
        headers,
    });

    return response;
}
