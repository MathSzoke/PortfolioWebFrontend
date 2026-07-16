import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { languages, getUrlCodeFromI18n, FALLBACK_URL_CODE } from './languageConfig.ts';

const validUrlCodes = languages.map(l => l.urlCode);

export default function LanguageLayout() {
    const { lang } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const locking = useRef(false);

    const rawPath = location.pathname || '/';
    const path = rawPath.endsWith('/') && rawPath !== '/' ? rawPath.slice(0, -1) : rawPath;

    const urlCode = validUrlCodes.includes((lang || '').toLowerCase()) ? (lang || '').toLowerCase() : FALLBACK_URL_CODE;
    const targetI18n = languages.find(l => l.urlCode === urlCode).i18nCode;

    useEffect(() => {
        if (locking.current) return;
        locking.current = true;

        const ensureLanguage = async () => {
            if (i18n.resolvedLanguage !== targetI18n) await i18n.changeLanguage(targetI18n);
            const canonical = `/${getUrlCodeFromI18n(i18n.resolvedLanguage ?? i18n.language, urlCode)}`;
            if (path !== canonical) navigate(canonical, { replace: true });
            locking.current = false;
        };

        ensureLanguage();
    }, [path, urlCode, targetI18n, i18n.resolvedLanguage, i18n.language, navigate]);

    return <Outlet />;
}
