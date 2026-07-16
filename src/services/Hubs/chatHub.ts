import * as signalR from "@microsoft/signalr";

export type ChatMessageDto = {
    id: string;
    sessionId: string;
    sender: "Visitor" | "Me" | "System";
    content: string;
    createdAt: string;
    readAt?: string | null;
};

function getBackendUrl() {
    const env: any = import.meta.env;
    const url = env.VITE_PORTFOLIO_API || env.VITE_API_BASE_URL;
    if (!url) throw new Error("API base URL not set.");
    return String(url).replace(/\/+$/, "");
}

export function getChatConnection() {
    const base = getBackendUrl();

    const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${base}/hubs/chat`, {
            withCredentials: true
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connection.onclose(err => console.error("SignalR closed:", err));
    connection.onreconnecting(err => console.warn("SignalR reconnecting:", err));
    connection.onreconnected(id => console.log("SignalR reconnected:", id));
    console.log("SignalR connected: ", connection.connectionId);
    return connection;
}
