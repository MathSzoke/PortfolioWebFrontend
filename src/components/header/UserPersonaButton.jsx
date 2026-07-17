import {
    Button, Persona, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
    makeStyles, tokens
} from '@fluentui/react-components';
import { ArrowExitFilled, SettingsFilled } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../services/auth';

const useStyles = makeStyles({
    buttonPersona: { ":hover": { backgroundColor: tokens.colorSubtleBackgroundHover } },
    menuItems: { paddingBottom: '1em', alignItems: 'anchor-center' },
    skeletonPersona: {
        minWidth: '190px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px'
    },
    skeletonText: {
        display: 'grid',
        justifyItems: 'end',
        gap: '5px'
    },
    skeletonLine: {
        height: '10px',
        borderRadius: tokens.borderRadiusSmall,
        background: `linear-gradient(90deg, ${tokens.colorNeutralBackground3} 25%, ${tokens.colorNeutralBackground4} 50%, ${tokens.colorNeutralBackground3} 75%)`,
        backgroundSize: '200% 100%',
        animationName: 'userPersonaSkeleton',
        animationDuration: '1.2s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite'
    },
    skeletonName: {
        width: '64px'
    },
    skeletonEmail: {
        width: '134px'
    },
    skeletonAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: `linear-gradient(90deg, ${tokens.colorNeutralBackground3} 25%, ${tokens.colorNeutralBackground4} 50%, ${tokens.colorNeutralBackground3} 75%)`,
        backgroundSize: '200% 100%',
        animationName: 'userPersonaSkeleton',
        animationDuration: '1.2s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite'
    }
});

export default function UserPersonaButton() {
    const { t } = useTranslation();
    const s = useStyles();
    const { userInfo, logout, isLoading } = useAuth();

    function openSettings() {
        window.dispatchEvent(new CustomEvent('open-settings'));
    }

    if (isLoading && !userInfo) {
        return (
            <Button
                className={s.buttonPersona}
                appearance="transparent"
                aria-label={t('header.userMenu.loading', 'Loading user profile')}
            >
                <div className={s.skeletonPersona} aria-hidden="true">
                    <div className={s.skeletonText}>
                        <div className={`${s.skeletonLine} ${s.skeletonName}`} />
                        <div className={`${s.skeletonLine} ${s.skeletonEmail}`} />
                    </div>
                    <div className={s.skeletonAvatar} />
                </div>
            </Button>
        );
    }

    return (
        <Menu positioning={{ position: 'below', align: 'end', offset: 4 }}>
            <MenuTrigger disableButtonEnhancement>
                <Button className={s.buttonPersona} appearance="transparent">
                    <Persona
                        textPosition="before"
                        name={userInfo?.name || ''}
                        secondaryText={userInfo?.email || ''}
                        presence={{ status: 'available' }}
                        avatar={userInfo?.picture ? { image: { src: userInfo.picture } } : undefined}
                    />
                </Button>
            </MenuTrigger>
            <MenuPopover>
                <MenuList>
                    <MenuItem className={s.menuItems} onClick={openSettings} subText={t('header.userMenu.settings.subText')} icon={<SettingsFilled />}>
                        {t('header.userMenu.settings.text')}
                    </MenuItem>
                    <MenuItem className={s.menuItems} onClick={logout} icon={<ArrowExitFilled />}>
                        {t('header.userMenu.logout')}
                    </MenuItem>
                </MenuList>
            </MenuPopover>
        </Menu>
    );
}
