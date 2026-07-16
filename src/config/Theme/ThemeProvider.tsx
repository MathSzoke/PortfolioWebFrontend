import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Theme } from '@fluentui/react-components';
import { FluentProvider } from '@fluentui/react-components';
import { portfolioDarkTheme, portfolioLightTheme } from './themes';
import FullPageLoader from '../../components/Loaders/FullPageLoader';

type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
    themeMode: ThemeMode;
    setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
export const useTheme = (): ThemeContextValue => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};

type Props = { children?: React.ReactNode };

export const ThemeProvider: React.FC<Props> = ({ children }) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('system');
    const [effectiveTheme, setEffectiveTheme] = useState<Theme>(portfolioLightTheme);
    const [isAppLoading, setIsAppLoading] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            setEffectiveTheme(themeMode === 'dark' ? portfolioDarkTheme : portfolioLightTheme);
            return;
        }

        const mq = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            const isSystemDark = mq.matches;
            const next =
                themeMode === 'system'
                    ? isSystemDark
                        ? portfolioDarkTheme
                        : portfolioLightTheme
                    : themeMode === 'light'
                        ? portfolioLightTheme
                        : portfolioDarkTheme;
            setEffectiveTheme(next);
        };

        applyTheme();

        if ('addEventListener' in mq) {
            mq.addEventListener('change', applyTheme);
            return () => mq.removeEventListener('change', applyTheme);
        } else {
            // Safari/legacy
            // @ts-ignore
            mq.addListener(applyTheme);
            return () => {
                // @ts-ignore
                mq.removeListener(applyTheme);
            };
        }
    }, [themeMode]);

    const handleLoadingComplete = () => setIsAppLoading(false);

    const ctx = useMemo<ThemeContextValue>(() => ({ themeMode, setThemeMode }), [themeMode]);

    if (isAppLoading) {
        return (
            <FluentProvider theme={effectiveTheme} targetDocument={document}>
                <FullPageLoader onComplete={handleLoadingComplete} />
            </FluentProvider>
        );
    }

    return (
        <ThemeContext.Provider value={ctx}>
            <FluentProvider theme={effectiveTheme} targetDocument={document} style={{height: "100%"}}>
                {children}
            </FluentProvider>
        </ThemeContext.Provider>
    );
};
