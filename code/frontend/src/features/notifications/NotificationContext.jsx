import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  const [stompClient, setStompClient] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await api.get("/api/notifications");
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotifications();

      const socket = new SockJS("http://localhost:8082/ws");
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe(`/topic/user-${user.id}`, (message) => {
            if (message.body) {
              const newNotification = JSON.parse(message.body);
              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
          });
        },
        onStompError: (frame) => {
          console.error("Broker reported error: " + frame.headers["message"]);
          console.error("Additional details: " + frame.body);
        },
      });

      client.activate();
      setStompClient(client);

      return () => {
        client.deactivate();
      };
    } else {
      if (stompClient) {
        stompClient.deactivate();
        setStompClient(null);
      }
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn, user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(`/api/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
