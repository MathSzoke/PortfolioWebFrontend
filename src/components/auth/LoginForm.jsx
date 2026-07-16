import React from 'react';
import { Body1, Button, Divider, Field, Input } from '@fluentui/react-components';
import { Link } from 'react-router-dom';
import { authStyles } from './auth-styles';
import { GoogleAuthButton } from './GoogleAuthButton';
import { LinkedInAuthButton } from './LinkedInAuthButton';

export const LoginForm = ({ register, errors, lang, t, isSubmitting, onSwitchToRegister, onAuthSuccess }) => {
    const styles = authStyles();
    return (
        <>
            <div className={styles.stack}>
                <GoogleAuthButton mode="login" onAuthSuccess={onAuthSuccess} />
                <LinkedInAuthButton mode="login" onAuthSuccess={onAuthSuccess} />
            </div>
            <Divider className={styles.or}>{t('auth.social.or')}</Divider>
            <Field className={styles.loginFields} label={t('auth.labels.email')} validationMessage={errors.email?.message} validationState={errors.email ? 'error' : 'none'}>
                <Input type="email" {...register('email', { required: t('auth.validation.required_email'), pattern: { value: /^\S+@\S+\.\S+$/, message: t('auth.validation.invalid_email') } })} />
            </Field>
            <Field className={styles.loginFields} label={t('auth.labels.password')} validationMessage={errors.password?.message} validationState={errors.password ? 'error' : 'none'}>
                <Input type="password" {...register('password', { required: t('auth.validation.required_password') })} />
            </Field>
            <Button type="submit" className={styles.buttonLogin} appearance="primary" size="large" disabled={isSubmitting}>{t('auth.login.cta')}</Button>
            <div className={styles.footerLinks}>
                <Link to={`/${lang}/forgot-password`} className={styles.link}>{t('auth.login.forgot_password')}</Link>
                <Body1>
                    {t('auth.login.no_account')}{' '}
                    <a
                        href="#"
                        className={styles.link}
                        onClick={(e) => {
                            e.preventDefault();
                            onSwitchToRegister && onSwitchToRegister();
                        }}
                    >
                        {t('auth.login.goTo.Signup')}
                    </a>
                </Body1>
            </div>
        </>
    );
};
