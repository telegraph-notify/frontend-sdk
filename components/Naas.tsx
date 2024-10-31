import React, { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

import { NotificationType } from "../types/index";

type NaasProps = {
  user_id: string;
  websocketUrl: string | undefined;
};

export default function Naas({ user_id, websocketUrl }: NaasProps) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsController, setWsController] = useState<WebSocket | null>(null);
  const [inAppEnabled, setInAppEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const handleToggleInApp = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    const newStatus = !inAppEnabled;
    wsController!.send(
      JSON.stringify({
        action: "updatePreference",
        payload: { user_id, in_app: newStatus, email: emailEnabled },
      })
    );
    setInAppEnabled(newStatus);
  };

  const handleToggleEmail = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    const newStatus = !emailEnabled;
    wsController!.send(
      JSON.stringify({
        action: "updatePreference",
        payload: { user_id, in_app: inAppEnabled, email: newStatus },
      })
    );
    setEmailEnabled(newStatus);
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

    setNotifications((prevState) =>
      prevState.filter(
        (notification) => notification.notification_id !== notification_id
      )
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
      setNotifications((prevState) =>
        prevState.map((note) =>
          note.notification_id === notification_id
            ? { ...note, status: "read" }
            : note
        )
      );

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
      const ws = new WebSocket(
        `${websocketUrl}?user_id=${encodeURIComponent(user_id)}`
      );
      setWsController(ws);

      // set status of ws connection when ws handshake is complete
      ws.onopen = () => {
        console.log("ws connection opened");
        setWsConnected(true);
        console.log("requesting initial data");
        ws.send(
          JSON.stringify({
            action: "initialData",
            payload: { user_id },
          })
        );
      };

      ws.onclose = () => {
        console.log("lost ws connection");
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
          setInAppEnabled(payload.preferences.inapp);
          setEmailEnabled(payload.preferences.email);
        } else if (payload.topic === "initial_data") {
          setInAppEnabled(payload.preference.in_app);
          setEmailEnabled(payload.preference.email);
          setNotifications((notifications) => {
            return payload.notifications.concat(notifications);
          });
        }
      };
    }
  }, []);

  return (
    wsConnected && (
      <>
        <NotificationDropdown
          notifications={notifications}
          handleDeleteMessage={handleDeleteMessage}
          handleReadMessage={handleReadMessage}
          handleToggleInApp={handleToggleInApp}
          handleToggleEmail={handleToggleEmail}
          inAppEnabled={inAppEnabled}
          emailEnabled={emailEnabled}
        />
      </>
    )
  );
}
