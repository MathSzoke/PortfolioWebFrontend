import { useEffect, useMemo, useReducer, useCallback, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import getApiClient from "../../services/apiClient";

function normalizeSessions(r) {
    const arr = Array.isArray(r) ? r : (Array.isArray(r?.items) ? r.items : []);
    return arr.map(x => ({
        id: x.id ?? x.Id,
        senderId: x.senderId ?? x.SenderId ?? null,
        recipientId: x.recipientId ?? x.RecipientId ?? null,
        status: x.status ?? x.Status,
        createdAt: x.createdAt ?? x.CreatedAt,
        lastSenderSeenAt: x.lastSenderSeenAt ?? x.LastSenderSeenAt ?? null,
        lastRecipientSeenAt: x.lastRecipientSeenAt ?? x.LastRecipientSeenAt ?? null
    }));
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
            dispatch({ type: "SET", items: normalizeSessions(r) });
        } catch { dispatch({ type: "SET", items: [] }); }
    }, [open, apiBase, userId, api]);

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
        sessions: state.items
    }), [state.items]);
}
