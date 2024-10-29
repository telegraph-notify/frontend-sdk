import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Badge,
  ListItemText,
  ListItemSecondaryAction,
  Box,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";

import { NotificationType } from "../types/index";

interface NotificationDropdownProps {
  userHash: string;
  notifications: NotificationType[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationType[]>>;
  wsController: WebSocket;
}

const NotificationDropdown = ({
  userHash,
  notifications,
  setNotifications,
  wsController,
}: NotificationDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<(EventTarget & Element) | null>(
    null
  );

  const open = Boolean(anchorEl);

  const handleOpenBell = (event: React.SyntheticEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseBell = () => {
    setAnchorEl(null);
  };

  const handleDeleteMessage = (
    event: React.SyntheticEvent,
    notification_id: string
  ) => {
    event.stopPropagation();
    console.log("item deleted");

    wsController.send(
      JSON.stringify({
        action: "updateNotification",
        payload: { notification_id, userHash, status: "delete" },
      })
    );

    setNotifications((prevState) => {
      return prevState.filter(
        (notification) => notification.notification_id !== notification_id
      );
    });
  };

  const handleReadMessage = (
    event: React.SyntheticEvent,
    notification_id: string
  ) => {
    event.stopPropagation();
    console.log("item clicked");

    wsController.send(
      JSON.stringify({
        action: "updateNotification",
        payload: { notification_id, userHash, status: "read" },
      })
    );

    setNotifications((prevState) => {
      return prevState.map((notification) => {
        if (notification.notification_id === notification_id) {
          return { ...notification, status: "read" };
        } else {
          return notification;
        }
      });
    });
  };

  return (
    <div>
      <IconButton
        color="inherit"
        aria-controls={open ? "notification-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleOpenBell}
        sx={{
          "&:focus": {
            outline: "none",
          },
        }}
      >
        <Badge
          badgeContent={
            notifications.filter((note) => note.status === "unread").length
          }
          color="error"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseBell}
        PaperProps={{
          style: {
            maxHeight: 350,
            width: "300px",
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>No new notifications</MenuItem>
        ) : (
          notifications.map((note) => (
            <MenuItem
              key={note.notification_id}
              id={note.notification_id}
              onClick={(event) =>
                handleReadMessage(event, note.notification_id)
              }
            >
              <ListItemText primary={note.message} />
              <ListItemSecondaryAction>
                {note.status === "unread" && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      width: 5,
                      height: 5,
                      backgroundColor: "red",
                      borderRadius: "50%",
                      marginLeft: 1,
                    }}
                  />
                )}
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(event) =>
                    handleDeleteMessage(event, note.notification_id)
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </MenuItem>
          ))
        )}
      </Menu>
    </div>
  );
};

export default NotificationDropdown;
