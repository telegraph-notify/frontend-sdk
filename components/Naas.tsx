import React, { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

import { NotificationType } from "../types/index";

type NaasProps = {
  userHash: string;
  websocketUrl: string | undefined;
};

export default function Naas({ userHash, websocketUrl }: NaasProps) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsController, setWsController] = useState<WebSocket | null>(null);

  useEffect(() => {
    // make ws connection with server
    if (websocketUrl) {
      const ws = new WebSocket(
        `${websocketUrl}?user_id=${encodeURIComponent(userHash)}`
      );

      // set status of ws connection when ws handshake is complete
      ws.onopen = () => {
        setWsConnected(true);
        setWsController(ws);
      };

      // client receives message from server
      ws.onmessage = ({ data }) => {
        setNotifications((notifications) => {
          return JSON.parse(data).concat(notifications);
        });
      };
    }
  }, []);

  return (
    wsConnected && (
      <>
        <NotificationDropdown
          userHash={userHash}
          notifications={notifications}
          setNotifications={setNotifications}
          wsController={wsController!}
        />
      </>
    )
  );
}
