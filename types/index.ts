import React from "react";

export type NotificationType = {
  notification_id: string;
  message: string;
  created_at: string;
  status: string;
};

export type NotificationDropdownProps = {
  notifications: NotificationType[];
  handleToggleChannel: (event: React.SyntheticEvent, channel: string) => void;
  handleDeleteMessage: (
    event: React.SyntheticEvent,
    notification_id: string
  ) => void;
  handleReadMessage: (
    event: React.SyntheticEvent,
    notification_id: string
  ) => void;
  inAppEnabled: boolean;
  emailEnabled: boolean;
};
