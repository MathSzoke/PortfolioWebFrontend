import React from 'react';
import {useTheme} from '../../../config/Theme/ThemeProvider';
import {useTranslation} from 'react-i18next';
import {Body1, Caption1, makeStyles, mergeClasses, shorthands, ToggleButton, tokens} from '@fluentui/react-components';

const useStyles = makeStyles({
    themeTitle: {
        fontWeight: 'var(--fontWeightSemibold)',
    },
    themePanel: {
        width: '100%',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--colorScrollbarOverlay)',
    },
    toggleGroup: {
        display: 'flex',
        columnGap: '13px',
        rowGap: '13px',
        justifyContent: 'start',
        flexWrap: 'wrap',
        paddingBottom: '16px',
        paddingTop: '6px',
    },
    toggleItem: {
        display: 'grid',
    },
    buttons: {
        backgroundColor: 'var(--colorTransparentBackgroundSelected)',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        paddingBottom: 0,
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        alignItems: 'center',
    },
    themeButton: {
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
        ...shorthands.border('2px', 'solid', 'transparent'),

        ':hover': {
            ...shorthands.borderColor('transparent'),
        }
    },
    checkedButton: {
        ...shorthands.borderColor(tokens.colorBrandStroke1),

        ':hover': {
            ...shorthands.borderColor(tokens.colorBrandStroke1),
        }
    },
});

const ThemeSettings = ({labelledBy}) => {
    const styles = useStyles();
    const {themeMode, setThemeMode} = useTheme();
    const {t} = useTranslation();

    const themes = [
        {
            mode: 'system',
            label: t('settings.theme.system'),
            image: 'https://res.cdn.office.net/fluid/prod/loop-app/hashed/systemTheme.2f8dd110d4c83770d3f3-1.svg'
        },
        {
            mode: 'light',
            label: t('settings.theme.light'),
            image: 'https://res.cdn.office.net/fluid/prod/loop-app/hashed/lightTheme.3a010179497429405785-1.svg'
        },
        {
            mode: 'dark',
            label: t('settings.theme.dark'),
            image: 'https://res.cdn.office.net/fluid/prod/loop-app/hashed/darkTheme.6576f41a83316db1b950-1.svg'
        },
    ];

    return (
        <div role="tabpanel" aria-labelledby={labelledBy} className={styles.themePanel}>
            <Body1 className={styles.themeTitle} id="theme">{t('settings.theme.title')}</Body1>
            <div role="group" aria-labelledby="theme" className={styles.toggleGroup}>
                {themes.map(({mode, label, image}) => (
                    <ToggleButton
                        key={mode}
                        appearance="subtle"
                        className={mergeClasses(styles.themeButton, themeMode === mode && styles.checkedButton, styles.buttons)}
                        checked={themeMode === mode}
                        onClick={() => setThemeMode(mode)}
                    >
                        <img src={image} alt={`Preview do tema ${label}`} className={styles.cardImage}/>
                        <Caption1>{label}</Caption1>
                    </ToggleButton>
                ))}
            </div>
        </div>
    );
};

export default ThemeSettings;
