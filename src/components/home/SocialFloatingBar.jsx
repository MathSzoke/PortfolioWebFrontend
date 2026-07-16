import { Button, makeStyles, tokens, Tooltip } from '@fluentui/react-components';
import { FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
    bar: {
        position: 'fixed',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 1000,
    },
    dot: {
        width: 2,
        height: 80,
        backgroundColor: tokens.colorNeutralStroke1,
        margin: '4px auto',
        borderRadius: 999,
    },
    hideOnMobile: {
        '@media (max-width: 900px)': {
            display: 'none',
        },
    },
    linkedin:{
        ":hover":{
            color: '#0e76a8'
        }
    }
});

export default function SocialFloatingBar() {
    const s = useStyles();
    const { t } = useTranslation();

    return (
        <div className={`${s.bar} ${s.hideOnMobile}`} aria-label={t('social.ariaLabel')}>
            <Button
                as="a"
                href="https://github.com/MathSzoke"
                target="_blank"
                appearance="transparent"
                icon={<FaGithub size={20} />}
                aria-label={t('social.github')}
            />

            <Button
                as="a"
                className={s.linkedin}
                href="https://linkedin.com/in/mathszoke"
                target="_blank"
                appearance="transparent"
                icon={<FaLinkedin size={20} />}
                aria-label={t('social.linkedin')}
            />

            <Button
                as="a"
                href="https://wa.me/5511991381138"
                target="_blank"
                appearance="transparent"
                icon={<FaWhatsapp size={20} />}
                aria-label={t('social.whatsapp')}
            />

            <div className={s.dot} />
        </div>
    );
}
