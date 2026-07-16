import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
    Button, Persona, makeStyles, tokens, Toaster, useToastController, useId,
    ToastTitle, ToastTrigger, Toast, Link
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useAuth } from '../../services/auth';
import { useTranslation } from 'react-i18next';
import { ChatInput } from './ChatInput.jsx';
import { ChatBubbles } from './ChatBubbles.jsx';
import { useChat } from '../../services/context/ChatContext';
import { HeaderWithStatus } from './HeaderWithStatus.jsx';
import { StartChatButton } from './StartChatButton.jsx';
import { useSessionsStore } from './useSessionsStore';
import getApiClient from '../../services/apiClient';
import { getChatConnection } from '../../services/signalrClient';

const useStyles = makeStyles({
    container: {
        position: 'fixed',
        right: '24px',
        bottom: '88px',
        zIndex: 9999,
        width: '85%',
        maxWidth: '800px',
        height: '75%',
        maxHeight: '600px',
        display: 'flex',
        background: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: '18px',
        boxShadow: '0 4px 32px #0002'
    },
    sidebar: {
        width: '35%',
        background: tokens.colorNeutralBackground2,
        borderTopLeftRadius: '18px',
        borderBottomLeftRadius: '18px',
        borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '20px 12px 12px'
    },
    userCard: {
        width: '100%',
        borderRadius: '14px',
        gap: '12px',
        display: 'flex',
        flexDirection: 'column'
    },
    listItem: {
        width: '100%',
        borderRadius: '12px',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        overflow: 'hidden',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground2Hover,
            transform: 'scale(1.02)'
        }
    },
    listItemBtn: { width: '100%', justifyContent: 'flex-start', padding: '6px 8px', height: 'auto' },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: tokens.colorNeutralBackground1Hover,
        borderTopRightRadius: '18px',
        borderBottomRightRadius: '18px'
    },
    topBar: {
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '0 10px',
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`
    },
    messagesWrapper: {
        flex: 1,
        overflowY: 'auto',
        padding: '1em',
        background: tokens.colorNeutralBackground1Hover,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '40px'
    },
    emptyState: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    inputBar: {
        background: tokens.colorNeutralBackground1,
        borderRadius: '26px',
        marginRight: '12px',
        marginLeft: '12px',
        marginBottom: '12px'
    }
});

async function fetchUserMini(userId) {
    const api = getApiClient();
    const r = await api.get(`/api/v1/User/ById/${userId}`);
    return { id: r.id, name: r.fullName, email: r.email, picture: r.avatarUrl };
}

export function ChatDialog({ apiBase, open, onClose, onSend, onStart, started, isOwner = false }) {
    const s = useStyles();
    const [input, setInput] = useState('');
    const endRef = useRef(null);

    const { userInfo, token, mathInfo } = useAuth();
    const { t } = useTranslation();
    const { sessionId, ensureSession, selectSession } = useChat();

    const [thinking, setThinking] = useState(false);
    const [peers, setPeers] = useState({});
    const [activeSessionId, setActiveSessionId] = useState(null);

    const toasterId = useId('chat-toaster');
    const { dispatchToast, dismissToast, pauseToast } = useToastController(toasterId);
    const stickyRef = useRef(null);

    const { sessions } = useSessionsStore({ open, apiBase, userId: userInfo?.id });

    useEffect(() => {
        if (!open) {
            if (stickyRef.current) { dismissToast(stickyRef.current); stickyRef.current = null; }
            return;
        }
        if (!stickyRef.current && userInfo) {
            const id = dispatchToast(
                <Toast>
                    <ToastTitle action={<ToastTrigger><Link><Dismiss24Regular /></Link></ToastTrigger>}>
                        {t('common.aiWarn')}
                    </ToastTitle>
                </Toast>,
                { toastId: 'chat-sticky', intent: 'warning', toasterId }
            );
            stickyRef.current = id || 'chat-sticky';
            pauseToast(stickyRef.current);
        }
    }, [open, userInfo, dispatchToast, dismissToast, pauseToast, toasterId, t]);

    const resolvedSessionId = useMemo(() => activeSessionId || sessionId, [activeSessionId, sessionId]);

    useEffect(() => {
        if (!open) return;
        if (!activeSessionId && !sessionId && sessions.length > 0) {
            const first = sessions[0].id;
            setActiveSessionId(first);
            selectSession(first);
        }
    }, [open, sessions, activeSessionId, sessionId, selectSession]);

    const loadPeers = useCallback(async () => {
        if (!userInfo?.id) return;
        const me = userInfo.id;
        const ids = new Set();
        for (const it of sessions) {
            const pid = it.senderId === me ? it.recipientId : it.senderId;
            if (pid && !peers[pid]) ids.add(pid);
        }
        if (!ids.size) return;
        const entries = await Promise.all([...ids].map(async id => [id, await fetchUserMini(id)]));
        setPeers(prev => {
            const next = { ...prev };
            for (const [id, mini] of entries) next[id] = mini;
            return next;
        });
    }, [sessions, peers, userInfo?.id]);
    useEffect(() => { if (open) loadPeers(); }, [open, sessions, loadPeers]);

    useEffect(() => {
        setThinking(false);
    }, [resolvedSessionId]);

    useEffect(() => {
        if (!open) return;
        if (!apiBase) return;
        if (!resolvedSessionId) return;

        const { connection, startOnce } = getChatConnection(apiBase, () => localStorage.getItem('authToken'));

        const onMessage = (m) => {
            const sid = m.sessionId || resolvedSessionId;
            if (sid !== resolvedSessionId) return;
            if (m.senderUserId !== userInfo?.id) setThinking(false);
        };

        connection.off('MessagePosted', onMessage);
        connection.on('MessagePosted', onMessage);

        (async () => {
            try {
                await startOnce();
                await connection.invoke('JoinSession', resolvedSessionId);
            } catch {
            }
        })();

        return () => {
            connection.off('MessagePosted', onMessage);
        };
    }, [open, apiBase, resolvedSessionId, userInfo?.id]);

    const handleStart = useCallback(async () => {
        if (!mathInfo?.id || !userInfo?.id) return;
        const existing = sessions.find(sx =>
            (sx.senderId === userInfo.id && sx.recipientId === mathInfo.id) ||
            (sx.senderId === mathInfo.id && sx.recipientId === userInfo.id)
        );
        if (existing) {
            setActiveSessionId(existing.id);
            await selectSession(existing.id);
        } else {
            const id = await ensureSession(mathInfo.id);
            if (id) {
                setActiveSessionId(id);
                await selectSession(id);
            }
        }
        onStart?.();
    }, [mathInfo?.id, userInfo?.id, sessions, ensureSession, selectSession, onStart]);

    const showStart = ((!isOwner && sessions.length === 0) || userInfo === null);
    if (!open) return null;

    return (
        <div className={s.container}>
            <div className={s.sidebar}>
                <div className={s.userCard}>
                    {!showStart && sessions.map(it => {
                        const me = userInfo?.id || null;
                        const peerId = it.senderId === me ? it.recipientId : it.senderId;
                        const peer = (peerId && peers[peerId]) ? peers[peerId] : { name: 'Usuário', email: '', picture: '' };
                        return (
                            <div
                                key={it.id}
                                className={s.listItem}
                                role="button"
                                tabIndex={0}
                                onClick={async () => {
                                    setActiveSessionId(it.id);
                                    await selectSession(it.id);
                                    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
                                }}>
                                <Button appearance="transparent" className={s.listItemBtn}>
                                    <Persona
                                        name={peer.name}
                                        secondaryText={peer.email}
                                        avatar={{ image: { src: peer.picture } }}
                                    />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={s.chatArea}>
                <div className={s.topBar}>
                    <HeaderWithStatus apiBase={apiBase} />
                    <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
                </div>

                <div className={s.messagesWrapper}>
                    <Toaster inline position="bottom-start" toasterId={toasterId} limit={1} />
                    {showStart ? (
                        <div className={s.emptyState}>
                            <StartChatButton onStarted={handleStart} />
                        </div>
                    ) : (
                        <>
                            {resolvedSessionId && userInfo?.id && (
                                <ChatBubbles sessionId={resolvedSessionId} meId={userInfo.id} thinking={thinking} />
                            )}
                            <div ref={endRef} />
                        </>
                    )}
                </div>

                {!isOwner && !showStart && (
                    <div className={s.inputBar}>
                        <ChatInput
                            value={input}
                            onChange={setInput}
                            onSend={async (msg) => {
                                setThinking(true);
                                setInput('');
                                await onSend(msg);
                                setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
                                setTimeout(() => setThinking(false), 0);
                            }}
                            disabled={thinking}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
