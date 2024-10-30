import React from "react";
import NotificationDropdown from "./NotificationDropdown";

import { useEffect, useState } from "react";

type NotificationType = {
  id: number;
  message: string;
};

type NaasProps = {
  userHash: string;
  websocketUrl: string;
};

export default function Naas({ userHash, websocketUrl }: NaasProps) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(
      websocketUrl + "?hash=" + encodeURIComponent(userHash)
    );
    ws.onopen = () => {
      console.log("ws connected");
      setWsConnected(true);
    };

    ws.onmessage = ({ data }) => {
      setNotifications((notifications) =>
        notifications.concat(JSON.parse(data))
      );
      console.log("Received message:", data);
    };
  }, []);

  return (
    wsConnected && (
      <>
        <NotificationDropdown
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </>
    )
  );
}
