import NotificationDropdown from "./NotificationDropdown";

import { useEffect, useState } from "react";

type NotificationType = {
  id: number;
  message: string;
};

export default function Naas({ userHash }: { userHash: string }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/sse");
    eventSource.onmessage = async (event: MessageEvent<string>) => {
      setNotifications((notifications) =>
        notifications.concat(JSON.parse(event.data))
      );
    };

    eventSource.onerror = function (error) {
      console.error("EventSource failed:", error);
    };
  }, []);

  return (
    <>
      <NotificationDropdown
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </>
  );
}
