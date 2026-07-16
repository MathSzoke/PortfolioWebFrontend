import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import getApiClient from './apiClient';

type SocialPhoto = { provider: string; userPhotoUrl: string };

type UserProfile = {
    id: string;
    name: string;
    email?: string;
    picture?: string;
    roles?: string[];
    socialPhotos?: SocialPhoto[];
    uploadedPhotos?: string[];
};

type AuthContextType = {
    token: string | null;
    userInfo: UserProfile | null;
    mathInfo: UserProfile | null;
    isLoading: boolean;
    login: (data: any) => void;
    logout: () => Promise<void>;
    refreshToken: () => Promise<string>;
    isRole: (roles: string[]) => boolean;
    refreshUserProfile: () => Promise<void>;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
    const [mathInfo, setMathInfo] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = useCallback((data: any) => {
        const access = data.accessToken || data.token || data;
        if (!access) return;
        localStorage.setItem('authToken', access);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        setToken(access);
    }, []);

    const logout = useCallback(async () => {
        try {
            const api = getApiClient();
            await api.post('/api/v1/auth/logout');
        } catch { }
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setUserInfo(null);
    }, []);

    const refreshToken = useCallback(async () => {
        const api = getApiClient();
        const result = await api.post(
            '/api/v1/auth/refresh',
            { refreshTokenStorage: localStorage.getItem('refreshToken') },
            { skipAuth: true }
        );

        if (!result?.accessToken) throw new Error('refresh_failed');

        localStorage.setItem('authToken', result.accessToken);
        if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken);
        setToken(result.accessToken);
        return result.accessToken;
    }, []);

    const fetchUserProfile = useCallback(async (t: string) => {
        try {
            const decoded: any = jwtDecode(t);
            const roles =
                decoded.roles ??
                decoded.role ??
                decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            const profile: UserProfile = {
                id: decoded.sub,
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                roles: Array.isArray(roles) ? roles : roles ? [roles] : []
            };

            const api = getApiClient(refreshToken);
            const d = await api.get('/api/v1/User');
            profile.socialPhotos = d?.socialPhotos || [];
            profile.uploadedPhotos = d?.uploadedPhotos || [];
            if (d?.avatarUrl) profile.picture = d.avatarUrl;
            if (d?.fullName) profile.name = d.fullName;

            setUserInfo(profile);
        } catch {
            setUserInfo(null);
        }
    }, [refreshToken]);

    useEffect(() => {
        let cancelled = false;
        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetchUserProfile(token).finally(() => {
            if (!cancelled) setIsLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, [token, fetchUserProfile]);

    useEffect(() => {
        const loadMath = async () => {
            try {
                const api = getApiClient(refreshToken);
                const d = await api.get('/api/v1/User/matheusszoke@gmail.com');
                if (d) {
                    setMathInfo({
                        id: d.id,
                        name: d.fullName,
                        email: d.email,
                        picture: d.avatarUrl
                    });
                }
            } catch { }
        };
        loadMath();
    }, [refreshToken]);

    const refreshUserProfile = useCallback(async () => {
        if (token) await fetchUserProfile(token);
    }, [token, fetchUserProfile]);

    const isRole = (roles: string[]) => {
        if (!userInfo?.roles) return false;
        return roles.some(r => userInfo.roles!.includes(r));
    };

    const value = useMemo(() => ({
        token,
        userInfo,
        mathInfo,
        isLoading,
        login,
        logout,
        refreshToken,
        isRole,
        refreshUserProfile,
        isAuthenticated: !!token
    }), [token, userInfo, mathInfo, isLoading, login, logout, refreshToken]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
