import { useEffect, useMemo, useState } from 'react';
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
import { Dismiss24Regular, Person24Regular, Delete24Regular } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import ProfileDataSettings from './ProfileDataSettings.jsx';
import DeleteAccount from './DeleteAccount.jsx';

const useStyles = makeStyles({
    surface: {
        width: 'calc(100% - 16px)',
        height: 'calc(100% - 16px)',
        maxHeight: '595px',
        maxWidth: '662px',
        minWidth: '288px',
        ...shorthands.overflow('hidden')
    },
    content: {
        display: 'grid',
        columnGap: '24px',
        gridTemplateColumns: '1.25fr 2fr'
    },
    sidebar: {
        maxWidth: '224px',
        width: '100%'
    },
    navTab: {
        justifyContent: 'flex-start',
        height: '36px',
        width: '100%',
        fontWeight: tokens.fontWeightRegular,
        color: tokens.colorNeutralForeground2,
        ...shorthands.padding('0', '8px'),
        ...shorthands.borderRadius(tokens.borderRadiusLarge),
        ':enabled:hover': {
            backgroundColor: tokens.colorSubtleBackgroundHover,
            '> .fui-Tab__icon': { color: tokens.colorCompoundBrandStroke }
        }
    },
    selectedNavTab: {
        backgroundColor: tokens.colorSubtleBackgroundSelected,
        fontWeight: tokens.fontWeightSemibold,
        '> .fui-Tab__icon': { color: tokens.colorNeutralForeground2 },
        ':hover': { backgroundColor: tokens.colorSubtleBackgroundSelected }
    }
});

export default function UserSettingsModal() {
    const s = useStyles();
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('profile');
    const lang = useMemo(() => (i18n.resolvedLanguage || 'pt-BR').toLowerCase(), [i18n.resolvedLanguage]);

    useEffect(() => {
        const onOpen = () => setOpen(true);
        window.addEventListener('open-settings', onOpen);
        return () => window.removeEventListener('open-settings', onOpen);
    }, []);

    useEffect(() => {
        if (!open) setTab('profile');
    }, [open]);

    return (
        <Dialog modalType="modal" open={open} onOpenChange={(_, d) => setOpen(d.open)}>
            <DialogSurface className={s.surface}>
                <DialogBody>
                    <DialogTitle
                        action={
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="subtle" aria-label={t('common.close')} icon={<Dismiss24Regular />} onClick={() => setOpen(false)} />
                            </DialogTrigger>
                        }
                    >
                        {t('settings.account.sidebar.title')}
                    </DialogTitle>
                    <DialogContent className={s.content}>
                        <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value)} vertical className={s.sidebar}>
                            <Tab value="profile" icon={<Person24Regular />} className={mergeClasses(s.navTab, tab === 'profile' && s.selectedNavTab)}>
                                {t('settings.account.sidebar.profile')}
                            </Tab>
                            <Tab value="deleteAccount" icon={<Delete24Regular />} className={mergeClasses(s.navTab, tab === 'deleteAccount' && s.selectedNavTab)}>
                                {t('settings.account.sidebar.deleteAccount')}
                            </Tab>
                        </TabList>

                        <div role="tabpanel" aria-labelledby="profile" hidden={tab !== 'profile'}>
                            <ProfileDataSettings />
                        </div>

                        <div role="tabpanel" aria-labelledby="deleteAccount" hidden={tab !== 'deleteAccount'}>
                            <DeleteAccount onClose={() => setOpen(false)} />
                        </div>
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
