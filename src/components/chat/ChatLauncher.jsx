import { useEffect, useState } from 'react';
import { Button, makeStyles } from '@fluentui/react-components';
import { ArrowUpFilled, ArrowDownFilled } from '@fluentui/react-icons';
import { ChatDialog } from './ChatDialog.jsx';
import { useChat } from '../../services/context/ChatContext';

const useStyles = makeStyles({
    floatingButton: {
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        zIndex: 9999
    }
});

export function ChatLauncherFloatingButton({ apiBase }) {
    const s = useStyles();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [started, setStarted] = useState(false);
    const { ensureSession, postMessage } = useChat();

    useEffect(() => {
        const handler = () => setOpen(true);
        window.addEventListener('open-chat', handler);
        return () => window.removeEventListener('open-chat', handler);
    }, []);

    async function handleSend(msg) {
        await postMessage(msg);
    }

    async function handleStart() {
        setStarted(true);
        setMessages([]);
    }

    return (
        <>
            <Button
                className={s.floatingButton}
                appearance="primary"
                onClick={() => setOpen(!open)}
                icon={open ? <ArrowDownFilled /> : <ArrowUpFilled />}
            />
            <ChatDialog
                apiBase={apiBase}
                open={open}
                onClose={() => { setOpen(false); setStarted(false); setMessages([]); }}
                messages={messages}
                onSend={handleSend}
                onStart={handleStart}
                started={started}
            />
        </>
    );
}
