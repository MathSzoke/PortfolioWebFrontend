import {
    Button, Persona, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem,
    makeStyles, tokens
} from '@fluentui/react-components';
import { ArrowExitFilled, SettingsFilled } from '@fluentui/react-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../services/auth';

const useStyles = makeStyles({
    buttonPersona: { ":hover": { backgroundColor: tokens.colorSubtleBackgroundHover } },
    menuItems: { paddingBottom: '1em', alignItems: 'anchor-center' }
});

export default function UserPersonaButton() {
    const { t } = useTranslation();
    const s = useStyles();
    const { userInfo, logout } = useAuth();

    function openSettings() {
        window.dispatchEvent(new CustomEvent('open-settings'));
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
