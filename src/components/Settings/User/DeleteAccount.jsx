import { useState } from 'react';
import { Button, Field, Input, MessageBar, MessageBarBody, makeStyles } from '@fluentui/react-components';
import { useTranslation, Trans } from 'react-i18next';
import useApiClient from '../../../services/useApiClient';
import { useAuth } from '../../../services/auth';

const useStyles = makeStyles({
    wrap: { display: 'grid', rowGap: '12px' },
    footer: { display: 'flex', justifyContent: 'flex-end' },
    messageBarContent: { contain: 'inline-size' }
});

export default function DeleteAccount({ onClose }) {
    const s = useStyles();
    const { t } = useTranslation();
    const [confirmText, setConfirmText] = useState('');
    const [status, setStatus] = useState({ type: '', msg: '' });
    const apiClient = useApiClient();
    const { logout } = useAuth();

    async function onDelete() {
        try {
            await apiClient.delete('/api/v1/User');
            logout();
            onClose && onClose();
        } catch {
            setStatus({ type: 'error', msg: t('settings.account.danger.error') });
        }
    }

    return (
        <div className={s.wrap}>
            {status.msg ? (
                <MessageBar className={s.messageBarContent} intent="error">
                    <MessageBarBody>{status.msg}</MessageBarBody>
                </MessageBar>
            ) : null}
            <MessageBar className={s.messageBarContent} intent="warning">
                <MessageBarBody>{t('settings.account.danger.desc')}</MessageBarBody>
            </MessageBar>
            <Field
                label={
                    <Trans
                        i18nKey="settings.account.danger.confirmLabel"
                        components={{ bold: <strong /> }}
                    />
                }
            >
                <Input
                    value={confirmText}
                    onChange={(_, v) => setConfirmText(v.value)}
                    placeholder={t('settings.account.danger.confirmPlaceholder')}
                />
            </Field>
            <div className={s.footer}>
                <Button
                    appearance="primary"
                    danger
                    disabled={confirmText !== 'DELETE'}
                    onClick={onDelete}
                >
                    {t('settings.account.danger.button')}
                </Button>
            </div>
        </div>
    );
}
