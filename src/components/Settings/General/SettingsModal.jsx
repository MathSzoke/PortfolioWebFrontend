import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Dialog,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    makeStyles,
    mergeClasses,
    shorthands,
    Tab,
    TabList,
    tokens
} from '@fluentui/react-components';
import { Dismiss24Regular, Settings24Regular, Translate24Regular } from '@fluentui/react-icons';
import ThemeSettings from './ThemeSettings';
import LanguageSettings from './LanguageSettings';

const useStyles = makeStyles({
    surface: {
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 16px)',
        maxHeight: '595px',
        maxWidth: '662px',
        minWidth: '288px',
        ...shorthands.overflow('hidden'),
    },
    body: {
        height: '100%',
        minWidth: '267px'
    },
    titleWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shorthands.padding('1rem', '1.5rem', '0.5rem', '1.5rem'),
    },
    content: {
        display: 'grid',
        columnGap: '24px',
        gridTemplateColumns: '1.25fr 2fr',
    },
    sidebar: {
        maxWidth: '224px',
        width: '100%',
    },
    navTab: {
        justifyContent: 'flex-start',
        height: '36px',
        width: '100%',
        fontWeight: tokens.fontWeightRegular,
        color: tokens.colorNeutralForeground2,
        ...shorthands.padding('0px', '8px'),
        ...shorthands.borderRadius(tokens.borderRadiusLarge),

        ':enabled:hover': {
            backgroundColor: tokens.colorSubtleBackgroundHover,
            '> .fui-Tab__icon': {
                color: tokens.colorCompoundBrandStroke,
            },
        },
    },
    selectedNavTab: {
        backgroundColor: tokens.colorSubtleBackgroundSelected,
        fontWeight: tokens.fontWeightSemibold,

        '> .fui-Tab__icon': {
            color: tokens.colorNeutralForeground2,
        },

        ':hover': {
            backgroundColor: tokens.colorSubtleBackgroundSelected,
        }
    },
});

function useIsWide(minWidth = 371) {
    const getMatches = useCallback(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
    }, [minWidth]);

    const [isWide, setIsWide] = useState(getMatches);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia(`(min-width: ${minWidth}px)`);
        const handler = (e) => setIsWide(e.matches);

        if (mql.addEventListener) mql.addEventListener('change', handler);
        else mql.addListener(handler);

        setIsWide(mql.matches);

        return () => {
            if (mql.removeEventListener) mql.removeEventListener('change', handler);
            else mql.removeListener(handler);
        };
    }, [minWidth]);

    return isWide;
}

const SettingsModal = ({ isOpen, onClose }) => {
    const styles = useStyles();
    const [selectedTab, setSelectedTab] = useState('general');
    const { t } = useTranslation();
    const isWide = useIsWide(371);

    const navigationItems = [
        { id: 'general', icon: <Settings24Regular />, label: t('settings.sidebar.general', 'Geral') },
        { id: 'language', icon: <Translate24Regular />, label: t('settings.sidebar.language', 'Idioma') }
    ];

    return (
        <Dialog modalType='modal' open={isOpen} onOpenChange={(event, data) => !data.open && onClose()}>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle>{t('settings.sidebar.title')}</DialogTitle>
                    <DialogTitle
                        action={
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="subtle" aria-label="Fechar" icon={<Dismiss24Regular />} onClick={onClose} />
                            </DialogTrigger>
                        }
                    />
                    <DialogContent className={styles.content}>
                        <TabList
                            selectedValue={selectedTab}
                            onTabSelect={(event, data) => setSelectedTab(data.value)}
                            vertical
                            className={styles.sidebar}
                        >
                            {navigationItems.map(item => (
                                <Tab
                                    key={item.id}
                                    id={`settingsTab-${item.id}`}
                                    value={item.id}
                                    icon={item.icon}
                                    className={mergeClasses(styles.navTab, selectedTab === item.id && styles.selectedNavTab)}
                                >
                                    {isWide && item.label}
                                </Tab>
                            ))}
                        </TabList>

                        <div role="tabpanel" aria-labelledby="settingsTab-general" hidden={selectedTab !== 'general'}>
                            <ThemeSettings />
                        </div>
                        <div role="tabpanel" aria-labelledby="settingsTab-language" hidden={selectedTab !== 'language'}>
                            <LanguageSettings />
                        </div>
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default SettingsModal;
