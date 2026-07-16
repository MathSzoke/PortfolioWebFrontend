import { useState, useCallback, useEffect } from 'react';
import {
    Button,
    Toolbar,
    ToolbarButton,
    makeStyles,
    mergeClasses,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    useRestoreFocusSource,
    useRestoreFocusTarget
} from '@fluentui/react-components';
import { Settings24Regular, Navigation24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import SettingsModal from '../Settings/General/SettingsModal';
import AuthModal from '../auth/AuthModal.jsx';
import UserSettingsModal from '../Settings/User/UserSettingsModal.jsx';
import UserPersonaButton from '../header/UserPersonaButton.jsx';
import { useAuth } from '../../services/auth';

const useStyles = makeStyles({
    wrapper: {
        position: 'fixed',
        width: '100%',
        top: 0,
        zIndex: 20,
        backgroundColor: 'transparent',
        borderBottom: '1px solid transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        transition: 'background-color 150ms ease, backdrop-filter 150ms ease, border-color 150ms ease, box-shadow 150ms ease'
    },
    scrolled: {
        backgroundColor: 'color-mix(in srgb, var(--colorNeutralBackground1) 95%, transparent)'
    },
    bar: {
        maxWidth: 1200,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '12px 16px',
        gap: 12,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        margin: '0 1rem',
        webkitBackdropFilter: 'blur(10px)',
        backdropFilter: 'blur(10px)',
        transition: 'background-color .3s, border-color .3s'
    },
    center: {
        justifySelf: 'center',
        '@media (max-width: 320px)': {
            display: 'none'
        }
    },
    right: {
        justifySelf: 'end',
        display: 'flex',
        gap: '3em',
        alignItems: 'center',
        '@media (max-width: 768px)': {
            display: 'none'
        }
    },
    mobileMenuButton: {
        display: 'none',
        '@media (max-width: 768px)': {
            display: 'flex',
            justifySelf: 'start'
        }
    },
    drawerNav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px'
    },
    drawerBody: {
            height: '-webkit-fill-available',
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column'
    },
    drawerContents: {
        margin: '0 auto'
    },
    sections: {
        width: 'auto',
        '@media (min-width: 320px)': {
            display: 'none'
        }
    }
});

export default function HeaderSection() {
    const s = useStyles();
    const { t } = useTranslation();
    const [openSettings, setOpenSettings] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const { isAuthenticated } = useAuth();
    const restoreFocusTargetAttributes = useRestoreFocusTarget();
    const restoreFocusSourceAttributes = useRestoreFocusSource();

    const scrollToSection = useCallback((id) => {
        const el = document.getElementById(id);
        if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setOpenDrawer(false);
        }
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <header className={mergeClasses(s.wrapper, scrolled && s.scrolled)}>
                <div className={s.bar}>
                    <div className={s.mobileMenuButton}>
                        <Button
                            {...restoreFocusTargetAttributes}
                            appearance="subtle"
                            aria-label="Menu"
                            icon={<Navigation24Regular />}
                            onClick={() => setOpenDrawer(true)}
                        />
                    </div>
                    <div />
                    <div className={s.center}>
                        <Toolbar size="small" aria-label="Navigation">
                            <ToolbarButton appearance="subtle" onClick={() => scrollToSection('hero')}>{t('header.nav.hero')}</ToolbarButton>
                            <ToolbarButton appearance="subtle" onClick={() => scrollToSection('about')}>{t('header.nav.about')}</ToolbarButton>
                            <ToolbarButton appearance="subtle" onClick={() => scrollToSection('projects')}>{t('header.nav.projects')}</ToolbarButton>
                        </Toolbar>
                    </div>
                    <div className={s.right}>
                        <Button appearance="subtle" aria-label={t('header.buttons.settings')} icon={<Settings24Regular />} onClick={() => setOpenSettings(true)} />
                        {isAuthenticated ? (
                            <UserPersonaButton />
                        ) : (
                            <Button appearance="secondary" onClick={() => window.dispatchEvent(new CustomEvent('open-login'))}>
                                {t('header.buttons.login')}
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <Drawer
                {...restoreFocusSourceAttributes}
                type="overlay"
                separator
                open={openDrawer}
                onOpenChange={(_, { open }) => setOpenDrawer(open)}
            >
                <DrawerHeader>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                aria-label={t('common.close')}
                                icon={<Dismiss24Regular />}
                                onClick={() => setOpenDrawer(false)}
                            />
                        }
                    >
                        {t('header.nav.title', 'Menu')}
                    </DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody className={s.drawerNav}>
                    <div className={s.drawerBody}>
                        <div className={s.drawerContents}>
                            <Toolbar vertical size="small" aria-label="vertical" className={s.sections}>
                                <ToolbarButton appearance="subtle" onClick={() => scrollToSection('hero')}>{t('header.nav.hero')}</ToolbarButton>
                                <ToolbarButton appearance="subtle" onClick={() => scrollToSection('about')}>{t('header.nav.about')}</ToolbarButton>
                                <ToolbarButton appearance="subtle" onClick={() => scrollToSection('projects')}>{t('header.nav.projects')}</ToolbarButton>
                            </Toolbar>
                            <Button
                                appearance="subtle"
                                icon={<Settings24Regular />}
                                onClick={() => {
                                    setOpenDrawer(false);
                                    setOpenSettings(true);
                                }}
                            >
                                {t('header.buttons.settings')}
                            </Button>
                        </div>
                        <div className={s.drawerContents}>
                            {isAuthenticated ? (
                                <UserPersonaButton />
                            ) : (
                                <Button
                                    appearance="secondary"
                                    onClick={() => {
                                        setOpenDrawer(false);
                                        window.dispatchEvent(new CustomEvent('open-login'));
                                    }}
                                >
                                    {t('header.buttons.login')}
                                </Button>
                            )}
                        </div>
                    </div>
                </DrawerBody>
            </Drawer>

            <SettingsModal isOpen={openSettings} onClose={() => setOpenSettings(false)} />
            <UserSettingsModal />
            <AuthModal />
        </>
    );
}
