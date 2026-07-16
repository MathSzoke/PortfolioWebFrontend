import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FullPageLoader from './components/Loaders/FullPageLoader';
import { getUrlCodeFromI18n } from './config/Language/languageConfig.ts';

const Root: React.FC = () => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        const resolved = i18n.resolvedLanguage ?? i18n.language;
        const targetUrlCode = getUrlCodeFromI18n(resolved);
        navigate(`/${targetUrlCode}`, { replace: true });
    }, [i18n.resolvedLanguage, i18n.language, navigate]);

    return <FullPageLoader />;
};

export default Root;
