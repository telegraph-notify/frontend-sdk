import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Badge,
  ListItemText,
  ListItemSecondaryAction,
  Box,
  Checkbox,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { NotificationDropdownProps } from "../types/index";

const NotificationDropdown = ({
  notifications,
  handleToggleChannel,
  inAppEnabled,
  emailEnabled,
  handleDeleteMessage,
  handleReadMessage,
}: NotificationDropdownProps) => {
  const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
  const [isSettingsView, setIsSettingsView] = useState(false);

  const isBellOpen = Boolean(bellAnchorEl);

  const handleOpenBell = (event: React.SyntheticEvent) => {
    setBellAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleCloseBell = () => {
    setBellAnchorEl(null);
    setIsSettingsView(false); // Reset to notifications view on close
  };

  return (
    <div>
      <IconButton
        color="inherit"
        aria-controls={isBellOpen ? "notification-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={isBellOpen ? "true" : undefined}
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
        anchorEl={bellAnchorEl}
        open={isBellOpen}
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
        {/* Top row with Close and Settings icons */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          py={1}
        >
          {isSettingsView ? (
            <IconButton onClick={() => setIsSettingsView(false)} edge="start">
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <IconButton onClick={handleCloseBell} edge="start">
              <CloseIcon />
            </IconButton>
          )}
          <Typography
            variant="subtitle1"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            {isSettingsView ? "Settings" : "Notifications"}
          </Typography>
          <IconButton
            onClick={() => setIsSettingsView(!isSettingsView)}
            edge="end"
          >
            <SettingsIcon />
          </IconButton>
        </Box>

        {isSettingsView ? (
          [
            <MenuItem
              key="in_app"
              onClick={(event) => handleToggleChannel(event, "in_app")}
            >
              <Checkbox checked={inAppEnabled} />
              <ListItemText primary="In App" />
            </MenuItem>,
            <MenuItem
              key="email"
              onClick={(event) => handleToggleChannel(event, "email")}
            >
              <Checkbox checked={emailEnabled} />
              <ListItemText primary="Email" />
            </MenuItem>,
          ]
        ) : notifications.length === 0 ? (
          <MenuItem>No new notifications</MenuItem>
        ) : (
          notifications.map((note) => (
            <MenuItem
              key={note.notification_id}
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
