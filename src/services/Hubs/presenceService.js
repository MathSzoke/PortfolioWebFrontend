import {HubConnectionBuilder, LogLevel} from '@microsoft/signalr';

class PresenceService {
    hubConnection = null;

    async startConnection(
        
    ) {
        if (this.hubConnection) {
            console.log("PresenceService: conexão já existente.");
            return;
        }

        const backendUrl = import.meta.env.VITE_BITERN_API;
        if (!backendUrl) return;

        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`${backendUrl}/hubs/presenceHub`, {
                accessTokenFactory: () => getToken()
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        try {
            await this.hubConnection.start();
            console.log("PresenceService: conexão estabelecida.");
        } catch (error) {
            console.error("PresenceService: erro ao conectar no hub:", error.toString());
        }
    }

    async stopConnection() {
        if (!this.hubConnection) return;

        try {
            await this.hubConnection.stop();
            console.log("PresenceService: conexão encerrada.");
        } catch (error) {
            console.error("PresenceService: erro ao encerrar a conexão:", error);
        } finally {
            this.hubConnection = null;
        }
    }

    async setStatus(status) {
        if (this.hubConnection?.state !== 'Connected') {
            return;
        }

        try {
            await this.hubConnection.invoke("SetMyStatus", status);
        } catch (error) {
            console.error("PresenceService: falha ao definir status:", error);
        }
    }

    on(event, callback) {
        this.hubConnection?.on(event, callback);
    }

    off(event, callback) {
        this.hubConnection?.off(event, callback);
    }
}

export const presenceService = new PresenceService();
