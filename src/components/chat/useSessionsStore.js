import { useEffect, useMemo, useReducer, useCallback, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import getApiClient from "../../services/apiClient";

function sessionActivity(session) {
    const senderSeen = session.lastSenderSeenAt ? new Date(session.lastSenderSeenAt).getTime() : 0;
    const recipientSeen = session.lastRecipientSeenAt ? new Date(session.lastRecipientSeenAt).getTime() : 0;
    const createdAt = session.createdAt ? new Date(session.createdAt).getTime() : 0;
    return Math.max(senderSeen, recipientSeen, createdAt);
}

function conversationKey(session, userId) {
    if (userId) {
        const peerId = session.senderId === userId ? session.recipientId : session.senderId;
        return peerId || session.id;
    }

    const ids = [session.senderId, session.recipientId].filter(Boolean).sort();
    return ids.length ? ids.join(':') : session.id;
}

function normalizeSessions(r, userId) {
    const arr = Array.isArray(r) ? r : (Array.isArray(r?.items) ? r.items : []);
    const normalized = arr.map(x => ({
        id: x.id ?? x.Id,
        senderId: x.senderId ?? x.SenderId ?? null,
        recipientId: x.recipientId ?? x.RecipientId ?? null,
        status: x.status ?? x.Status,
        createdAt: x.createdAt ?? x.CreatedAt,
        lastSenderSeenAt: x.lastSenderSeenAt ?? x.LastSenderSeenAt ?? null,
        lastRecipientSeenAt: x.lastRecipientSeenAt ?? x.LastRecipientSeenAt ?? null
    }));

    const byConversation = new Map();
    for (const session of normalized) {
        const key = conversationKey(session, userId);
        const current = byConversation.get(key);
        if (!current || sessionActivity(session) > sessionActivity(current)) {
            byConversation.set(key, session);
        }
    }

    return Array.from(byConversation.values())
        .sort((a, b) => sessionActivity(b) - sessionActivity(a));
}

function reducer(state, action) {
    switch (action.type) {
        case "SET": return { ...state, items: action.items };
        case "UPSERT": {
            const map = new Map(state.items.map(i => [i.id, i]));
            for (const it of action.items) map.set(it.id, { ...map.get(it.id), ...it });
            return { ...state, items: Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) };
        }
        case "REMOVE": {
            return { ...state, items: state.items.filter(i => i.id !== action.id) };
        }
        default: return state;
    }
}

export function useSessionsStore({ open, apiBase, userId }) {
    const [state, dispatch] = useReducer(reducer, { items: [] });
    const [connection, setConnection] = useState(null);
    const hubRef = useRef(null);
    const api = getApiClient();

    const fetchOnce = useCallback(async () => {
        if (!open || !apiBase || !userId) return;
        try {
            const r = await api.get("/api/v1/chat/sessions");
            dispatch({ type: "SET", items: normalizeSessions(r, userId) });
        } catch { dispatch({ type: "SET", items: [] }); }
    }, [open, apiBase, userId, api]);

    const deleteSession = useCallback(async (id) => {
        if (!id) return;
        dispatch({ type: "REMOVE", id });
        await api.delete(`/api/v1/chat/sessions/${id}`);
    }, [api]);

    useEffect(() => {
        if (!open || !apiBase || !userId) return;
        fetchOnce();
    }, [open, apiBase, userId, fetchOnce]);

    useEffect(() => {
        if (!open || !apiBase || !userId) return;

        const hub = new signalR.HubConnectionBuilder()
            .withUrl(`${apiBase}/hubs/sessions`, {})
            .withAutomaticReconnect()
            .build();

        setConnection(hub);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    connection.invoke("GetConnectionId").then(id => console.log("ConnectionID: ", id));
                    console.log("connected!");
                })
                .catch(e => console.log("Connection failed: ", e));
        }
    }, [connection]);

    return useMemo(() => ({
        sessions: state.items,
        deleteSession
    }), [state.items, deleteSession]);
}
