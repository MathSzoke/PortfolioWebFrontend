import React from "react";
import { Button } from "@fluentui/react-components";
import { useChat } from '../../services/context/ChatContext.js'
import { useTranslation } from "react-i18next";
import { useAuth } from '../../services/auth';

export const StartChatButton = ({ onStarted }) => {
    const { t } = useTranslation();
    const { hasOpenSession, ensureSession, open } = useChat();
    const { mathInfo, userInfo } = useAuth();

    if (hasOpenSession === true) return null;
    const start = async () => {
        if (userInfo === null) {
            window.dispatchEvent(new Event('open-login'));
            return;
        }
        open();
        if (onStarted) onStarted();
    };
    return <Button appearance="primary" onClick={start}>{t("chat.startConversation")}</Button>;
};
