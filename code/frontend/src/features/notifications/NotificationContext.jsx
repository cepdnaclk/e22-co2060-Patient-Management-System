import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import api from "../../services/axiosClient";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClientRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await api.get("/api/notifications");
      const data = response.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("[Notifications] Failed to fetch:", error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      // Clean up on logout
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch existing notifications from DB
    fetchNotifications();

    // Get JWT token for WebSocket auth
    const token = localStorage.getItem("pms_token");

    // Create STOMP client over SockJS
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8082/ws"),
      reconnectDelay: 5000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        console.log("[Notifications] WebSocket connected, subscribing to user-" + user.id);
        client.subscribe(`/topic/user-${user.id}`, (message) => {
          if (message.body) {
            try {
              const newNotification = JSON.parse(message.body);
              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);
            } catch (e) {
              console.error("[Notifications] Failed to parse message:", e);
            }
          }
        });
      },
      onDisconnect: () => {
        console.log("[Notifications] WebSocket disconnected");
      },
      onStompError: (frame) => {
        console.error("[Notifications] STOMP error:", frame.headers["message"], frame.body);
      },
      onWebSocketError: (error) => {
        console.error("[Notifications] WebSocket error:", error);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [isLoggedIn, user?.id]); // only re-run when login state or user ID changes

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("[Notifications] Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("[Notifications] Failed to mark all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
