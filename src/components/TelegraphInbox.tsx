import React, { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { NotificationType } from "../types/index";
import {
  updateNotificationStatus,
  handleReceivedData,
} from "../utils/websocketHelpers";

type TelegraphInboxProps = {
  user_id: string;
  userHash: string;
  websocketUrl: string | undefined;
};

export function TelegraphInbox({
  user_id,
  userHash,
  websocketUrl,
}: TelegraphInboxProps) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsController, setWsController] = useState<WebSocket | null>(null);
  const [inAppEnabled, setInAppEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [slackEnabled, setSlackEnabled] = useState(false);

  const updateNotification = (notification_id: string, status: string) => {
    setNotifications((prevNotifications) =>
      updateNotificationStatus(prevNotifications, notification_id, status)
    );
  };

  const handleToggleChannel = (
    event: React.SyntheticEvent,
    channel: string
  ) => {
    event.stopPropagation();
    const payload: { user_id: string; [key: string]: any } = {
      user_id,
      in_app: inAppEnabled,
      email: emailEnabled,
      slack: slackEnabled,
    };
    payload[channel] = !payload[channel];
    wsController!.send(JSON.stringify({ action: "updatePreference", payload }));
  };

  const handleDeleteMessage = (
    event: React.SyntheticEvent,
    notification_id: string
  ) => {
    event.stopPropagation();
    wsController!.send(
      JSON.stringify({
        action: "updateNotification",
        payload: { notification_id, user_id, status: "delete" },
      })
    );
  };

  const handleReadMessage = (
    event: React.SyntheticEvent,
    notification_id: string
  ) => {
    event.stopPropagation();
    const notification = notifications.find(
      (note) => note.notification_id === notification_id
    );
    if (notification?.status === "unread") {
      wsController!.send(
        JSON.stringify({
          action: "updateNotification",
          payload: { notification_id, user_id, status: "read" },
        })
      );
    }
  };

  const connectWebSocket = () => {
    const id = encodeURIComponent(user_id);
    const hash = encodeURIComponent(userHash);
    const ws = new WebSocket(`${websocketUrl}?user_id=${id}&userHash=${hash}`);

    ws.onopen = () => handleWsOpen(ws);
    ws.onclose = handleWsClose;
    ws.onmessage = (event) =>
      handleReceivedData(
        event.data,
        setNotifications,
        setInAppEnabled,
        setEmailEnabled,
        setSlackEnabled,
        updateNotification
      );

    setWsController(ws);
  };

  const handleWsOpen = (ws: WebSocket) => {
    console.log("WebSocket connection opened");
    setWsConnected(true);
    ws.send(
      JSON.stringify({ action: "initialData", payload: { user_id, userHash } })
    );
    startPingInterval(ws);
  };

  const handleWsClose = () => {
    console.log("WebSocket connection closed");
    setWsConnected(false);
  };

  const startPingInterval = (ws: WebSocket) => {
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({ action: "ping", payload: { user_id: "ping" } })
        );
      }
    }, 9 * 60 * 1000); // 9 minutes
  };

  useEffect(() => {
    if (websocketUrl) {
      connectWebSocket();
    }
  }, [websocketUrl]);

  return (
    wsConnected && (
      <NotificationDropdown
        notifications={notifications}
        handleDeleteMessage={handleDeleteMessage}
        handleReadMessage={handleReadMessage}
        handleToggleChannel={handleToggleChannel}
        inAppEnabled={inAppEnabled}
        emailEnabled={emailEnabled}
        slackEnabled={slackEnabled}
      />
    )
  );
}
