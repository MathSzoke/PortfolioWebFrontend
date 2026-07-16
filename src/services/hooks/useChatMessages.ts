import { useEffect, useRef, useState } from "react";
import { HubConnectionState } from "@microsoft/signalr";
import { getChatConnection } from "../signalrClient";
import useApiClient from "../useApiClient";

type Msg = {
    id: string;
    sessionId: string;
    content: string;
    sender: string;
    senderUserId?: string | null;
    createdAt: string;
    readAt?: string | null;
};

function uniqueSorted(next: Msg[]) {
    const map = new Map<string, Msg>();
    for (const m of next) map.set(m.id, m);
    return [...map.values()].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export function useChatMessages(apiBase: string, sessionId?: string, getToken?: () => string | null) {
    const api = useApiClient();
    const [messages, setMessages] = useState<Msg[]>([]);
    const sessionRef = useRef(sessionId);
    sessionRef.current = sessionId;

    useEffect(() => {
        if (!apiBase || !sessionId) return;

        let disposed = false;
        const runTag = Symbol();

        setMessages([]);

        const fetchHistory = async () => {
            try {
                const body = await api.get(`/api/v1/chat/sessions/${sessionId}/messages`);
                const list = Array.isArray(body)
                    ? body
                    : Array.isArray(body?.chatMessageItems)
                        ? body.chatMessageItems
                        : [];

                const normalized: Msg[] = list.map((m: any) => ({
                    id: m.id,
                    sessionId: body?.sessionId ?? sessionId,
                    sender: m.sender,
                    senderUserId: m.senderUserId ?? null,
                    content: m.content,
                    createdAt: m.createdAt,
                    readAt: m.readAt ?? null,
                }));

                if (!disposed) setMessages(uniqueSorted(normalized));
            } catch {
                if (!disposed) setMessages([]);
            }
        };

        const { connection, startOnce } = getChatConnection(apiBase, getToken);

        const onMessage = (m: Msg) => {
            const sid = m.sessionId || sessionRef.current;
            if (sid !== sessionRef.current) return;
            setMessages(prev => uniqueSorted([...prev, { ...m, sessionId: sid! }]));
        };

        const onRead = (_payload: any) => {
        };

        connection.off("MessagePosted");
        connection.on("MessagePosted", onMessage);
        connection.off("MessageRead");
        connection.on("MessageRead", onRead);

        (async () => {
            try {
                await fetchHistory();
                await startOnce();
                await connection.invoke("JoinSession", sessionId);
            } catch (e) {
                console.warn("Connection failed: ", e);
            }
        })();

        return () => {
            disposed = true;
            if (connection.state === HubConnectionState.Connected && sessionRef.current) {
                connection.invoke("LeaveSession", sessionRef.current).catch(() => { });
            }
            connection.off("MessagePosted", onMessage);
            connection.off("MessageRead", onRead);
        };
    }, [sessionId]);

    return messages;
}
