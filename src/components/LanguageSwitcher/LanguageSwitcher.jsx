import React from 'react';
import {Button, makeStyles, mergeClasses, shorthands, tokens} from '@fluentui/react-components';
import {useLanguageNavigate} from './useLanguageNavigate';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap('4px'),
        '@media (max-width: 768px)': {
            flexDirection: 'column',
        },
    },
    flag: {
        ...shorthands.borderRadius('2px'),
        boxShadow: '0 0 1px rgba(0,0,0,0.1)',
    },
    langButton: {
        display: 'flex',
        alignItems: 'center',
        ...shorthands.gap('8px'),
        color: tokens.colorNeutralForeground2,
        backgroundColor: 'transparent',
        ...shorthands.border('1px', 'solid', 'transparent'),
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
            color: tokens.colorNeutralForeground2,
        }
    },
    selectedButton: {
        color: tokens.colorNeutralForeground1,
        ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
        }
    }
});

const LanguageSwitcher = () => {
    const styles = useStyles();
    const {changeLanguage, languages, i18n} = useLanguageNavigate();

    const isSelected = (lang) => lang.i18nCode === i18n.resolvedLanguage;

    return (
        <div className={styles.root}>
            {languages.map(({urlCode, i18nCode, label, countryCode}) => {
                const isSelectedFlag = isSelected({urlCode, i18nCode});
                return (
                    <Button
                        key={urlCode}
                        appearance="transparent"
                        className={mergeClasses(styles.langButton, isSelectedFlag && styles.selectedButton)}
                        onClick={() => changeLanguage(urlCode)}
                        aria-pressed={isSelectedFlag}
                        icon={<span className={mergeClasses(styles.flag, `fi fi-${countryCode}`)}/>}
                    >
                        {label}
                    </Button>
                );
            })}
        </div>
    );
};

export default LanguageSwitcher;