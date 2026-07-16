import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useApiClient from '../services/useApiClient';
import { useAuth } from '../services/auth';
import { Spinner } from '@fluentui/react-components';

export default function AuthLinkedinCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const apiClient = useApiClient();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const error = params.get('error');
        const redirectUri = window.location.origin + '/auth/callback/linkedin';

        if (error) {
            navigate("/", { replace: true });
            return;
        }
        if (code) {
            apiClient.post('/api/v1/auth/linkedin', { code, redirectUri })
                .then(data => {
                    login(data);
                    navigate("/", { replace: true });
                })
                .catch(() => {
                    navigate("/", { replace: true });
                });
        } else {
            navigate("/", { replace: true });
        }
    }, [location, apiClient, login, navigate]);

    return (
        <div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size="medium" label="Autenticando com LinkedIn..." />
        </div>
    );
}
