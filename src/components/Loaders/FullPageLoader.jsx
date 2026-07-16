import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Field, makeStyles, ProgressBar, tokens} from '@fluentui/react-components';

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

export function FullPageLoader({onComplete}) {
    const styles = useStyles();
    const {t} = useTranslation();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('loading');

    const checkServerStatus = useCallback(async () => {
        const backendUrl = import.meta.env.VITE_PORTFOLIO_API;
        if (!backendUrl) {
            console.error(`URL do backend não encontrada ${backendUrl}. Verifique as variáveis de ambiente do Aspire.`);
            setStatus('error');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/health`);
            if (response.ok) {
                setStatus('success');
            } else {
                setStatus('warning');
            }
        } catch (error) {
            console.error("Falha ao conectar com o backend:", error);
            setStatus('warning');
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const interval = setInterval(() => {
            if (!isMounted) return;

            setProgress(prev => {
                if (prev >= 1) {
                    clearInterval(interval);
                    return 1;
                }
                const nextProgress = Math.min(prev + 0.02, 1);

                if (nextProgress === 1) {
                    clearInterval(interval);
                    checkServerStatus();
                }
                return nextProgress;
            });
        }, 30);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [checkServerStatus]);

    useEffect(() => {
        if (status === 'success' || status === 'warning') {
            const timer = setTimeout(() => {
                onComplete?.();
            }, 1500);
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
                <ProgressBar value={progress} color={progressBarColor}/>
            </Field>
        </div>
    );
}

export default FullPageLoader;