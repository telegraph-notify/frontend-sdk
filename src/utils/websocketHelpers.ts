import { NotificationType } from "../types/index";

export function updateNotificationStatus(
  notifications: NotificationType[],
  notification_id: string,
  status: string
): NotificationType[] {
  if (status === "read") {
    return notifications.map((note) =>
      note.notification_id === notification_id
        ? { ...note, status: "read" }
        : note
    );
  } else if (status === "delete") {
    return notifications.filter(
      (notification) => notification.notification_id !== notification_id
    );
  }
  return notifications;
}

// Function to handle received data and update state accordingly
export function handleReceivedData(
  data: any,
  setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>,
  setInAppEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  setEmailEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  setSlackEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  updateNotification: (notification_id: string, status: string) => void
) {
  const payload = JSON.parse(data);

  switch (payload.topic) {
    case "notification":
      setNotifications((notifications) =>
        payload.notifications.concat(notifications)
      );
      break;
    case "preference":
      setInAppEnabled(payload.preference.in_app);
      setEmailEnabled(payload.preference.email);
      setSlackEnabled(payload.preference.slack);
      break;
    case "initial_data":
      setInAppEnabled(payload.preference.in_app);
      setEmailEnabled(payload.preference.email);
      setSlackEnabled(payload.preference.slack);
      setNotifications((notifications) =>
        payload.notifications.concat(notifications)
      );
      break;
    case "notif_updated":
      updateNotification(payload.notification_id, payload.status);
      break;
    default:
      console.log("Unknown topic:", payload.topic);
  }
}
