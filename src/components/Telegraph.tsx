import React, { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

import { NotificationType } from "../types/index";

type NaasProps = {
  user_id: string;
  userHash: string;
  websocketUrl: string | undefined;
};

export function Telegraph({ user_id, userHash, websocketUrl }: NaasProps) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsController, setWsController] = useState<WebSocket | null>(null);
  const [inAppEnabled, setInAppEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const handleToggleChannel = (
    event: React.SyntheticEvent,
    channel: string
  ) => {
    event.stopPropagation();
    const payload = { user_id, in_app: inAppEnabled, email: emailEnabled };
    switch (channel) {
      case "in_app":
        payload.in_app = !inAppEnabled;
        break;
      case "email":
        payload.email = !emailEnabled;
        break;
    }
    wsController!.send(
      JSON.stringify({
        action: "updatePreference",
        payload,
      })
    );
  };

  const updateNotification = (notification_id: string, status: string) => {
    if (status === "read") {
      setNotifications((prevState) =>
        prevState.map((note) =>
          note.notification_id === notification_id
            ? { ...note, status: "read" }
            : note
        )
      );
    } else if (status === "delete") {
      setNotifications((prevState) =>
        prevState.filter(
          (notification) => notification.notification_id !== notification_id
        )
      );
    }
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

    if (notification && notification.status === "unread") {
      wsController!.send(
        JSON.stringify({
          action: "updateNotification",
          payload: { notification_id, user_id, status: "read" },
        })
      );
    }
  };

  useEffect(() => {
    // make ws connection with server

    if (websocketUrl) {
      const id = encodeURIComponent(user_id);
      const hash = encodeURIComponent(userHash);

      const ws = new WebSocket(
        `${websocketUrl}?user_id=${id}&userHash=${hash}`
      );

      // set status of ws connection when ws handshake is complete
      ws.onopen = () => {
        console.log("ws connection opened");
        setWsConnected(true);
        console.log("requesting initial data");
        ws.send(
          JSON.stringify({
            action: "initialData",
            payload: { user_id, userHash },
          })
        );

        // Start keep-alive interval
        setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            console.log("sending ping");
            ws.send(
              JSON.stringify({
                action: "initialData",
                payload: { user_id: "ping" },
              })
            );
          }
        }, 9 * 60 * 1000); // 9 minutes
      };

      ws.onclose = () => {
        console.log("lost ws connection");
        setWsConnected(false);
      };

      // client receives message from server
      ws.onmessage = ({ data }) => {
        const payload = JSON.parse(data);
        console.log(payload);

        if (payload.topic === "notification") {
          setNotifications((notifications) => {
            return payload.notifications.concat(notifications);
          });
        } else if (payload.topic === "preference") {
          setInAppEnabled(payload.preference.in_app);
          setEmailEnabled(payload.preference.email);
        } else if (payload.topic === "initial_data") {
          setInAppEnabled(payload.preference.in_app);
          setEmailEnabled(payload.preference.email);
          setNotifications((notifications) => {
            return payload.notifications.concat(notifications);
          });
        } else if (payload.topic === "notif_updated") {
          updateNotification(payload.notification_id, payload.status);
        }
      };

      setWsController(ws);
    }
  }, []);

  return (
    wsConnected && (
      <>
        <NotificationDropdown
          notifications={notifications}
          handleDeleteMessage={handleDeleteMessage}
          handleReadMessage={handleReadMessage}
          handleToggleChannel={handleToggleChannel}
          inAppEnabled={inAppEnabled}
          emailEnabled={emailEnabled}
        />
      </>
    )
  );
}
