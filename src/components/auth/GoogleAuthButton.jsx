import React, { useState } from 'react';
import { Button, Spinner } from '@fluentui/react-components';
import { FcGoogle } from 'react-icons/fc';
import { useTranslation } from 'react-i18next';
import { authStyles } from './auth-styles';
import { useGoogleLogin } from '@react-oauth/google';
import useApiClient from '../../services/useApiClient';
import { useAuth } from '../../services/auth';

export const GoogleAuthButton = ({ mode, onAuthSuccess }) => {
    const styles = authStyles();
    const { t } = useTranslation();
    const apiClient = useApiClient();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const text = mode === 'login' ? t('auth.social.google_signin') : t('auth.social.google_signup');

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResp) => {
            setLoading(true);
            try {
                const data = await apiClient.post('/api/v1/auth/google', { accessToken: tokenResp.access_token });
                login(data);
                if (onAuthSuccess) onAuthSuccess();
            } finally {
                setLoading(false);
            }
        },
        onError: () => setLoading(false),
        flow: 'implicit'
    });

    return (
        <Button
            className={styles.socialButton}
            icon={loading ? <Spinner size="tiny" /> : <FcGoogle />}
            appearance="outline"
            onClick={() => googleLogin()}
            disabled={loading}
        >
            {loading ? t('auth.social.signing_in') : text}
        </Button>
    );
};
