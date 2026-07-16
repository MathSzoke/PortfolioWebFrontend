import React from 'react';
import {useTranslation} from 'react-i18next';
import {Body1, makeStyles, shorthands} from '@fluentui/react-components';
import LanguageSwitcher from '../../LanguageSwitcher/LanguageSwitcher';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('4px'),
    },
    switcherContainer: {
        marginTop: '1rem',
    }
});

const LanguageSettings = ({labelledBy}) => {
    const styles = useStyles();
    const {t} = useTranslation();

    return (
        <div role="tabpanel" aria-labelledby={labelledBy} className={styles.container}>
            <Body1 id="languageSettingsTitle">
                {t('settings.language.title')}
            </Body1>
            <div className={styles.switcherContainer} role="group" aria-labelledby="languageSettingsTitle">
                <LanguageSwitcher/>
            </div>
        </div>
    );
};

export default LanguageSettings;