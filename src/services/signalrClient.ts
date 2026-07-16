import * as signalR from "@microsoft/signalr";

const singletons = new Map<string, {
    connection: signalR.HubConnection,
    startPromise: Promise<void> | null
}>();

export function getChatConnection(apiBase: string, getToken?: () => string | null) {
    const key = `${apiBase}::/hubs/chat`;
    if (!singletons.has(key)) {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${apiBase}/hubs/chat`)
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        singletons.set(key, { connection, startPromise: null });
    }

    const entry = singletons.get(key)!;
    const { connection } = entry;

    async function startOnce() {
        if (connection.state === signalR.HubConnectionState.Connected) return;
        if (entry.startPromise) return entry.startPromise;

        entry.startPromise = connection.start()
            .catch(err => {
                entry.startPromise = null;
                throw err;
            });

        return entry.startPromise;
    }

    return { connection, startOnce };
}
