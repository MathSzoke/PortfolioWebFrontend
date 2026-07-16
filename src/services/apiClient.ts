import i18n from '../config/i18n';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = { exp?: number };

let refreshingPromise: Promise<string> | null = null;

const isTokenExpired = (token: string) => {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (!decoded.exp) return true;
        const buffer = 10;
        return (Date.now() / 1000) >= (decoded.exp - buffer);
    } catch {
        return true;
    }
};

const getApiClient = (refreshTokenCallback?: () => Promise<string>) => {
    const backendUrl = import.meta.env.VITE_PORTFOLIO_API || import.meta.env.VITE_API_BASE_URL;

    const refreshStoredToken = async () => {
        const refreshTokenStorage = localStorage.getItem('refreshToken');
        if (!refreshTokenStorage) return null;

        if (refreshTokenCallback) {
            return refreshTokenCallback();
        }

        const response = await fetch(`${backendUrl}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': i18n.resolvedLanguage || 'pt-BR'
            },
            credentials: 'include',
            body: JSON.stringify({ refreshTokenStorage })
        });

        if (!response.ok) return null;

        const result = await response.json();
        if (!result?.accessToken) return null;

        localStorage.setItem('authToken', result.accessToken);
        if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken);

        return result.accessToken as string;
    };

    const ensureValidToken = async () => {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!token || !refreshToken) return null;

        if (!isTokenExpired(token)) return token;

        if (!refreshingPromise) {
            refreshingPromise = refreshStoredToken().then(token => {
                if (!token) throw new Error('refresh_failed');
                return token;
            }).finally(() => {
                refreshingPromise = null;
            });
        }

        return refreshingPromise;
    };

    const request = async (
        method: string,
        endpoint: string,
        body: any = null,
        options: { skipAuth?: boolean } = {},
        retryOnUnauthorized = true
    ) => {
        const lang = i18n.resolvedLanguage || 'pt-BR';
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Accept-Language': lang
        });

        if (!options.skipAuth) {
            const token = await ensureValidToken();
            if (token) {
                headers.append('Authorization', `Bearer ${token}`);
            }
        }

        const config: RequestInit = {
            method,
            headers,
            credentials: 'include',
            body: body ? JSON.stringify(body) : null
        };

        const response = await fetch(`${backendUrl}${endpoint}`, config);

        if (response.status === 401 && !options.skipAuth && retryOnUnauthorized) {
            try {
                const refreshedToken = await refreshStoredToken();
                if (refreshedToken) {
                    return request(method, endpoint, body, options, false);
                }
            } catch {
                // Fall through to the logout path below.
            }
        }

        if (response.status === 401 && !options.skipAuth) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            throw new Error('unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const err: any = new Error(errorData.detail || `HTTP ${response.status}`);
            err.status = response.status;
            err.data = errorData;
            throw err;
        }

        return response.status === 204 ? null : response.json();
    };

    return {
        get: (e: string, o?: any) => request('GET', e, null, o),
        post: (e: string, b?: any, o?: any) => request('POST', e, b, o),
        put: (e: string, b?: any, o?: any) => request('PUT', e, b, o),
        delete: (e: string, b?: any, o?: any) => request('DELETE', e, b, o)
    };
};

export default getApiClient;
