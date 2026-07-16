import React from 'react';
import {Button} from '@fluentui/react-components';
import {FaLinkedin} from 'react-icons/fa';
import {useTranslation} from 'react-i18next';
import {authStyles} from './auth-styles';

export const LinkedInAuthButton = ({ mode }) => {
    const styles = authStyles();
    const { t } = useTranslation();
    const text = mode === 'login' ? t('auth.social.linkedin_signin') : t('auth.social.linkedin_signup');

    const loginLinkedin = () => {
        const params = {
            response_type: 'code',
            client_id: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
            redirect_uri: import.meta.env.VITE_LINKEDIN_REDIRECT_URI,
            scope: 'openid profile email',
            state: String(Math.random()).slice(2)
        };
        window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams(params)}`;

    };

    return (
        <Button className={styles.socialButton} icon={<FaLinkedin />} appearance="outline" onClick={loginLinkedin}>
            {text}
        </Button>
    );
};
