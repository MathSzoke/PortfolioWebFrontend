import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, makeStyles, MessageBar, MessageBarBody } from '@fluentui/react-components';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useApiClient from '../../services/useApiClient';
import { useAuth } from '../../services/auth';
import { LoginForm } from './LoginForm.jsx';
import { RegisterForm } from './RegisterForm.jsx';

const useStyles = makeStyles({
    surface: { width: 'calc(100% - 16px)', maxWidth: 480 },
    content: { display: 'grid', rowGap: 16, padding: '2em' },
    loginTitle: { padding: '0 0 1em 0' }
});

export default function AuthModal() {
    const s = useStyles();
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState('login');
    const { register, handleSubmit, formState, control, reset } = useForm({ defaultValues: { fullName: '', email: '', password: '' } });
    const lang = useMemo(() => (i18n.resolvedLanguage || 'pt-BR').toLowerCase(), [i18n.resolvedLanguage]);
    const apiClient = useApiClient();
    const { login } = useAuth();

    useEffect(() => {
        const onOpen = () => setOpen(true);
        window.addEventListener('open-login', onOpen);
        return () => window.removeEventListener('open-login', onOpen);
    }, []);

    useEffect(() => {
        if (!open) {
            setMode('login');
            reset({ fullName: '', email: '', password: '' });
        }
    }, [open, reset]);

    async function onSubmit(values) {
        if (mode === 'login') {
            const data = await apiClient.post('/api/v1/auth/login', { email: values.email, password: values.password });
            login(data);
            setOpen(false);
            return;
        }
        const reg = await apiClient.post('/api/v1/auth/register', { fullName: values.fullName, email: values.email, password: values.password });
        if (reg?.accessToken || reg?.token) {
            login(reg);
            setOpen(false);
            return;
        }
        const loginData = await apiClient.post('/api/v1/auth/login', { email: values.email, password: values.password });
        login(loginData);
        setOpen(false);
    }

    return (
        <Dialog modalType="modal" open={open} onOpenChange={(_, d) => setOpen(d.open)}>
            <DialogSurface className={s.surface}>
                <div>
                    <DialogTitle className={s.loginTitle}>
                        {mode === 'login' ? t('auth.login.title') : t('auth.register.title')}
                    </DialogTitle>
                    <MessageBar>
                        <MessageBarBody>{t('auth.login.warn')}</MessageBarBody>
                    </MessageBar>
                </div>
                <DialogBody>
                    <DialogContent className={s.content}>
                        {mode === 'login' ? (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <LoginForm
                                    register={register}
                                    errors={formState.errors}
                                    lang={lang}
                                    t={t}
                                    isSubmitting={formState.isSubmitting}
                                    onSwitchToRegister={() => setMode('register')}
                                    onAuthSuccess={() => setOpen(false)}
                                />
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <RegisterForm
                                    register={register}
                                    errors={formState.errors}
                                    lang={lang}
                                    t={t}
                                    isSubmitting={formState.isSubmitting}
                                    onSwitchToLogin={() => setMode('login')}
                                />
                            </form>
                        )}
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
