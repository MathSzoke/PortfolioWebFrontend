import { useEffect, useState } from 'react';
import {
    Button, Field, Input, MessageBar, MessageBarBody, makeStyles, Persona, mergeClasses, tokens
} from '@fluentui/react-components';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useApiClient from '../../../services/useApiClient';
import { useAuth } from '../../../services/auth';
import { Eye24Regular, EyeOff24Regular, Edit24Regular, CameraRegular } from '@fluentui/react-icons';
import AvatarPickerDialog from './AvatarPickerDialog';

const useStyles = makeStyles({
    form: { display: 'grid', rowGap: '12px' },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' },
    personaCard: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'background .15s ease, box-shadow .15s ease',
        ':hover': { backgroundColor: tokens.colorNeutralBackground1Hover },
        ':hover .overlay': { opacity: 1 }
    },
    overlay: {
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '12px',
        opacity: 0,
        transition: 'opacity .15s ease',
        backgroundColor: 'rgba(0,0,0,0.2)',
        color: 'white',
        pointerEvents: 'none'
    },
    personaAvatar: {
        '> .fui-Avatar':{ marginRight: '0' }
    },
    cameraIcon: {
        position: 'absolute',
        right: '10px',
        bottom: '10px',
        background: 'rgba(32,32,32,0.85)',
        borderRadius: '50%',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
    }
});

export default function ProfileDataSettings() {
    const s = useStyles();
    const { t, i18n } = useTranslation();
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [showPwd2, setShowPwd2] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { userInfo, login, refreshUserProfile } = useAuth();
    const apiClient = useApiClient();
    const [avatarPreview, setAvatarPreview] = useState(userInfo?.picture || '');

    const {
        control,
        handleSubmit,
        formState,
        getValues,
        setValue,
        watch,
        trigger,
        reset
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            fullName: userInfo?.name || '',
            email: userInfo?.email || '',
            imageUrl: userInfo?.picture || '',
            newPassword: '',
            confirmPassword: '',
            avatarFile: undefined
        }
    });

    const fullNameValue = watch('fullName');
    const emailValue = watch('email');
    const newPwd = watch('newPassword');

    useEffect(() => { trigger('confirmPassword'); }, [newPwd, trigger]);

    useEffect(() => {
        setAvatarPreview(userInfo?.picture || '');
        setValue('imageUrl', userInfo?.picture || '');
        setValue('fullName', userInfo?.name || '');
        setValue('email', userInfo?.email || '');
    }, [userInfo, setValue]);

    function openAvatarDialog() { setDialogOpen(true); }

    function onConfirmAvatar(result) {
        if (result.file) {
            setValue('avatarFile', result.file);
            setAvatarPreview(result.url || '');
        } else {
            const url = result.url || '';
            setValue('imageUrl', url);
            setAvatarPreview(url);
        }
    }

    async function onSave(values) {
        setStatus({ type: '', msg: '' });
        try {
            const payload = {
                fullName: values.fullName,
                email: emailValue,
                imageUrl: values.imageUrl,
                newPassword: values.newPassword?.trim() ? values.newPassword : null
            };
            const data = await apiClient.put('/api/v1/User', payload);
            if (data?.accessToken || data?.token) login(data);
            await refreshUserProfile();
            setStatus({ type: 'success', msg: t('settings.account.profile.success') });
            reset({
                fullName: data?.fullName ?? payload.fullName ?? '',
                email: data?.email ?? payload.email ?? '',
                imageUrl: data?.imageUrl ?? payload.imageUrl ?? '',
                newPassword: '',
                confirmPassword: '',
                avatarFile: undefined
            });
            setAvatarPreview(data?.imageUrl ?? payload.imageUrl ?? '');
        } catch {
            setStatus({ type: 'error', msg: t('settings.account.profile.error') });
        }
    }

    return (
        <>
            {status.msg ? (
                <MessageBar intent={status.type === 'success' ? 'success' : 'error'}>
                    <MessageBarBody>{status.msg}</MessageBarBody>
                </MessageBar>
            ) : null}
            <div className={s.personaCard} onClick={openAvatarDialog} style={{ position: 'relative' }}>
                <Persona
                    avatar={{ image: avatarPreview ? { src: avatarPreview } : undefined, name: fullNameValue || 'User' }}
                    size="huge"
                    className={s.personaAvatar}
                />
                <div className={s.cameraIcon}>
                    <CameraRegular style={{ borderRadius: "50%", padding: 4 }} />
                </div>
                <div className={mergeClasses('overlay', s.overlay)}>
                    <Edit24Regular />
                </div>
            </div>
            <form className={s.form} onSubmit={handleSubmit(onSave)}>
                <Field
                    label={t('settings.account.labels.fullName')}
                    validationMessage={formState.errors.fullName?.message}
                    validationState={formState.errors.fullName ? 'error' : 'none'}
                >
                    <Controller
                        control={control}
                        name="fullName"
                        rules={{ required: t('auth.validation.required_fullname') }}
                        render={({ field }) => <Input {...field} />}
                    />
                </Field>
                <Field
                    label={t('settings.account.labels.email')}
                    validationMessage={formState.errors.email?.message}
                    validationState={formState.errors.email ? 'error' : 'none'}
                    hint={t('settings.account.labels.emailLockedHint')}
                >
                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: t('auth.validation.required_email'),
                            pattern: { value: /^\S+@\S+\.\S+$/, message: t('auth.validation.invalid_email') }
                        }}
                        render={({ field }) => <Input type="email" disabled {...field} />}
                    />
                </Field>
                <Controller control={control} name="imageUrl" render={() => null} />
                <Controller control={control} name="avatarFile" render={() => null} />
                <Field label={t('auth.labels.password')}>
                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field }) => (
                            <Input
                                type={showPwd ? 'text' : 'password'}
                                {...field}
                                contentAfter={
                                    <Button
                                        appearance="transparent"
                                        size="small"
                                        type="button"
                                        onClick={() => setShowPwd(v => !v)}
                                        aria-label={showPwd ? t('common.close') : t('common.open')}
                                        icon={<Eye24Regular />}
                                    />
                                }
                            />
                        )}
                    />
                </Field>
                <Field
                    label={t('auth.labels.confirmPassword')}
                    validationMessage={formState.errors.confirmPassword?.message}
                    validationState={formState.errors.confirmPassword ? 'error' : 'none'}
                >
                    <Controller
                        control={control}
                        name="confirmPassword"
                        rules={{
                            validate: v => {
                                const np = getValues('newPassword') || '';
                                const cp = v || '';
                                if (!np && !cp) return true;
                                return cp === np || t('auth.validation.password_mismatch', 'Passwords do not match');
                            }
                        }}
                        render={({ field }) => (
                            <Input
                                type={showPwd2 ? 'text' : 'password'}
                                {...field}
                                contentAfter={
                                    <Button
                                        appearance="transparent"
                                        size="small"
                                        type="button"
                                        onClick={() => setShowPwd2(v => !v)}
                                        aria-label={showPwd2 ? t('common.close') : t('common.open')}
                                        icon={<EyeOff24Regular />}
                                    />
                                }
                            />
                        )}
                    />
                </Field>
                <div className={s.footer}>
                    <Button appearance="primary" type="submit" disabled={formState.isSubmitting}>
                        {t('settings.account.profile.save')}
                    </Button>
                </div>
            </form>
            <AvatarPickerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                initialUrl={avatarPreview}
                onConfirm={onConfirmAvatar}
                user={userInfo}
            />
        </>
    );
}
