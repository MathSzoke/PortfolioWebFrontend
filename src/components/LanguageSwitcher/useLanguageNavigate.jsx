import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

const languages = [
    { urlCode: 'br', i18nCode: 'pt-BR', label: 'Português (BR)', countryCode: 'br' },
    { urlCode: 'us', i18nCode: 'en-US', label: 'English (US)', countryCode: 'us' },
];

const urlToI18n = (code) => (code === 'us' ? 'en-US' : 'pt-BR');
const i18nToUrl = (lng) => (String(lng).toLowerCase().startsWith('en') ? 'us' : 'br');

export const useLanguageNavigate = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const normalizePath = useCallback((p) => {
        if (!p) return '/';
        const noQuery = p.split('?')[0].split('#')[0] || '/';
        if (noQuery !== '/' && noQuery.endsWith('/')) return noQuery.slice(0, -1);
        return noQuery;
    }, []);

    const getActiveUrlCode = useCallback(() => i18nToUrl(i18n.resolvedLanguage ?? i18n.language), [i18n.resolvedLanguage, i18n.language]);

    const navigateTo = useCallback((destination) => {
        const base = `/${getActiveUrlCode()}`;
        const dest = String(destination || '/');
        const norm = dest.startsWith('/') ? dest : `/${dest}`;
        const finalPath = norm === '/' ? base : `${base}${norm}`;
        const clean = normalizePath(finalPath);
        if (normalizePath(location.pathname) !== clean) navigate(clean, { replace: true });
    }, [getActiveUrlCode, navigate, location.pathname, normalizePath]);

    const changeLanguage = useCallback((newUrlCode) => {
        const targetLng = urlToI18n(newUrlCode);
        if ((i18n.resolvedLanguage ?? i18n.language) !== targetLng) i18n.changeLanguage(targetLng);
        const current = normalizePath(location.pathname);
        const parts = current.split('/').filter(Boolean);
        if (parts.length === 0) parts.push(newUrlCode);
        else parts[0] = newUrlCode;
        const newPath = `/${parts.join('/')}`;
        if (current !== newPath) navigate(newPath, { replace: true });
    }, [i18n, location.pathname, navigate, normalizePath]);

    return { navigateTo, changeLanguage, languages, i18n, getActiveUrlCode };
};