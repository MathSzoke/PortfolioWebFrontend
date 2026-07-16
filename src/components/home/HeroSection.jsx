import {
    Button,
    Text,
    Title3,
    tokens,
    makeStyles,
    Image
} from '@fluentui/react-components';
import { useTranslation, Trans } from 'react-i18next';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        '@media (max-width: 768px)': {
            flexDirection: 'column-reverse',
            gap: '20px'
        },
    },
    heroTextContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    sub: {
        color: tokens.colorNeutralForeground3,
        whiteSpace: 'pre-line',
        lineHeight: '1'
    },
    code: {
        color: tokens.colorBrandBackground
    },
    highlight: {
        fontSize: '2rem',
        fontWeight: 700,
        display: 'inline-block',
        fontFamily: 'sans-serif'
    },
    helloMessage: {
        fontFamily: 'monospace'
    },
    image: {
        border: `3px solid ${tokens.colorBrandBackground}`,
        '@media (max-width: 768px)': {
            height: '300px',
            width: '200px'
        },
    }
});

export default function HeroSection({ onSeeProjects }) {
    const s = useStyles();
    const { t } = useTranslation();

    const birthDate = new Date('2001-12-08');

    const age = (() => {
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years--;
        return years;
    })();

    return (
        <div className={s.root}>
            <div className={s.heroTextContent}>
                <Text className={s.helloMessage}>{t('hero.title')}</Text>
                <Title3 className={s.sub}>
                    <Trans
                        i18nKey="hero.introducingMe"
                        components={{
                            code: <code className={s.code} />,
                            span: <span className={s.highlight} />
                        }}
                    />
                </Title3>
            </div>

                <Image
                    alt={t('hero.imageAlt')}
                    shape="circular"
                    className={s.image}
                    src="/assets/my_image.png"
                    height={600}
                    width={400}
                />
        </div>
    );
}
