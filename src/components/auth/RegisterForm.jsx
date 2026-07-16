import React from 'react';
import { Button, Divider, Field, Input } from '@fluentui/react-components';
import { authStyles } from './auth-styles';
import { GoogleAuthButton } from './GoogleAuthButton';
import { LinkedInAuthButton } from './LinkedInAuthButton';

export const RegisterForm = ({ register, errors, lang, t, isSubmitting, onSwitchToLogin }) => {
    const styles = authStyles();
    return (
        <>
            <div className={styles.stack}>
                <GoogleAuthButton mode="register" />
                <LinkedInAuthButton mode="register" />
            </div>
            <Divider className={styles.or}>{t('auth.social.or')}</Divider>
            <Field className={styles.loginFields} label={t('auth.labels.fullName')} validationMessage={errors.fullName?.message} validationState={errors.fullName ? 'error' : 'none'}>
                <Input {...register('fullName', { required: t('auth.validation.required_fullname') })} />
            </Field>
            <Field className={styles.loginFields} label={t('auth.labels.email')} validationMessage={errors.email?.message} validationState={errors.email ? 'error' : 'none'}>
                <Input type="email" {...register('email', { required: t('auth.validation.required_email'), pattern: { value: /^\S+@\S+\.\S+$/, message: t('auth.validation.invalid_email') } })} />
            </Field>
            <Field className={styles.loginFields} label={t('auth.labels.password')} validationMessage={errors.password?.message} validationState={errors.password ? 'error' : 'none'}>
                <Input type="password" {...register('password', { required: t('auth.validation.required_password'), minLength: { value: 6, message: t('auth.validation.min_password') } })} />
            </Field>
            <Button type="submit" className={styles.buttonLogin} appearance="primary" size="large" disabled={isSubmitting}>{t('auth.register.cta')}</Button>
            <div className={styles.footerLinks}>
                <span />
                <a
                    href="#"
                    className={styles.link}
                    onClick={(e) => {
                        e.preventDefault();
                        onSwitchToLogin && onSwitchToLogin();
                    }}
                >
                    {t('auth.login.goTo.Login')}
                </a>
            </div>
        </>
    );
};
