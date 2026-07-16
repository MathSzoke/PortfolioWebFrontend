import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Field, makeStyles, ProgressBar, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
    root: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: tokens.colorNeutralBackground1,
        zIndex: 9999,
        transition: 'opacity 0.5s ease-in-out',
    },
    progressWrapper: {
        width: '50%',
    },
    percent: {
        float: 'right',
    }
});

export function FullPageLoader({ onComplete }) {
    const styles = useStyles();
    const { t } = useTranslation();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('loading');

    const checkServerStatus = useCallback(async () => {
        const backendUrl = import.meta.env.VITE_PORTFOLIO_API || import.meta.env.VITE_API_BASE_URL;
        if (!backendUrl) {
            console.warn(`URL do backend nao encontrada ${backendUrl}. Verifique as variaveis de ambiente.`);
            setStatus('warning');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/health`);
            setStatus(response.ok ? 'success' : 'warning');
        } catch (error) {
            console.error('Falha ao conectar com o backend:', error);
            setStatus('warning');
        }
    }, []);

    useEffect(() => {
        checkServerStatus();
    }, [checkServerStatus]);

    useEffect(() => {
        if (status !== 'loading') return;

        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 0.015, 0.95));
        }, 30);

        return () => clearInterval(interval);
    }, [status]);

    useEffect(() => {
        if (status === 'success' || status === 'warning') {
            setProgress(1);
            const timer = setTimeout(() => {
                onComplete?.();
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [status, onComplete]);

    const percent = Math.round(progress * 100);
    const progressBarColor = status === 'loading' ? 'brand' : status;

    return (
        <div className={styles.root}>
            <Field
                className={styles.progressWrapper}
                validationState={status === 'loading' ? 'none' : status}
                validationMessage={
                    <>
                        <span>{t(`loader.${status}`)}</span>
                        <span className={styles.percent}>{percent}%</span>
                    </>
                }
            >
                <ProgressBar value={progress} color={progressBarColor} />
            </Field>
        </div>
    );
}

export default FullPageLoader;
