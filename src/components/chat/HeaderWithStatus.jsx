import React, { useEffect, useState } from "react";
import { Badge, Text } from "@fluentui/react-components";
import { getOwnerPresence } from "../../services/Hubs/presence";

export const HeaderWithStatus = ({ apiBase }) => {
    const [online, setOnline] = useState(false);
    useEffect(() => {
        getOwnerPresence(apiBase, "matheusszoke@gmail.com").then(r => setOnline(r.online));
    }, [apiBase]);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text weight="semibold">Matheus Szoke</Text>
            {online ? <Badge appearance="filled" color="green" shape="circular"></Badge> : <Badge appearance="outline" color="brand">AI</Badge>}
        </div>
    );
};
