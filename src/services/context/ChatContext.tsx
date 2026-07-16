import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Toaster } from "@fluentui/react-components";
import { getChatConnection } from "../../services/Hubs/chatHub";
import type { ChatMessageDto } from "../../services/Hubs/chatHub";
import useApiClient from "../useApiClient";

type ChatContextType = {
    sessionId: string | null;
    messages: ChatMessageDto[];
    isOpen: boolean;
    open: () => void;
    close: () => void;
    postMessage: (text: string) => Promise<void>;
    ensureSession: (recipientId?: string) => Promise<string | null>;
    selectSession: (id: string | null) => Promise<void>;
    hasOpenSession: boolean | null;
};

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const api = useApiClient();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpenSession, setHasOpenSession] = useState<boolean | null>(null);

    //useEffect(() => {
    //    api.get("/api/v1/chat/sessions/me/has-open", { skipAuth: true })
    //        .then((b: any) => setHasOpenSession(Boolean(b)))
    //        .catch(() => setHasOpenSession(null));
    //}, [api]);

    const fetchMessages = async (sid?: string) => {
        const id = sid ?? sessionId;
        if (!id) return;
        const list = await api.get(`/api/v1/chat/sessions/${id}/messages`, { skipAuth: true });
        if (Array.isArray(list)) {
            setMessages(list as any);
        } else if (list && Array.isArray(list.chatMessageItems)) {
            const normalized: ChatMessageDto[] = list.chatMessageItems.map((m: any) => ({
                id: m.id,
                sessionId: list.sessionId ?? id,
                sender: m.sender,
                senderUserId: m.senderUserId,
                content: m.content,
                createdAt: m.createdAt,
                readAt: m.readAt ?? null,
            }));
            setMessages(normalized);
        } else {
            setMessages([]);
        }
    };

    useEffect(() => {
        if (!isOpen || !sessionId) return;

        let unsub: (() => void) | null = null;
        let mounted = true;

        (async () => {
            const hub = await getChatConnection();
            await hub.invoke("JoinSession", sessionId).catch(() => { });

            const onPosted = (m: ChatMessageDto) => {
                const sid = (m as any).sessionId ?? sessionId;
                if (sid !== sessionId) return;

                setMessages(prev => {
                    if (prev.some(x => x.id === m.id)) return prev;
                    return [...prev, m];
                });
            };

            hub.on("MessagePosted", onPosted);

            unsub = () => {
                try { hub.off("MessagePosted", onPosted); } catch { }
                try { hub.invoke("LeaveSession", sessionId).catch(() => { }); } catch { }
            };
        })();

        return () => { if (unsub) unsub(); };
    }, [isOpen, sessionId]);

    const ensureSession = async (recipientId?: string) => {
        if (sessionId) return sessionId;
        const data = await api.post("/api/v1/chat/sessions/start", { RecipientId: recipientId });
        const id = data?.id ?? null;
        if (id) {
            setSessionId(id);
            setHasOpenSession(true);
            await fetchMessages(id);
        }
        return id;
    };

    const selectSession = async (id: string | null) => {
        setSessionId(id);
        if (id) await fetchMessages(id);
        else setMessages([]);
    };

    const postMessage = async (text: string) => {
        if (!sessionId || !text?.trim()) return;
        await api.post(`/api/v1/chat/sessions/${sessionId}/messages`, { content: text, asMe: false });
    };

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    const value = useMemo(
        () => ({ sessionId, messages, isOpen, open, close, postMessage, ensureSession, selectSession, hasOpenSession }),
        [sessionId, messages, isOpen, hasOpenSession]
    );

    return (
        <ChatContext.Provider value={value}>
            <Toaster />
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("ChatContext");
    return ctx;
};
