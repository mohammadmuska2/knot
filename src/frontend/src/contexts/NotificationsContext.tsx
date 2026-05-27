import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "../utils/api";

export type NotificationType =
  | "endorsement"
  | "learning_request"
  | "profile_view"
  | "certification"
  | string;

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number; // ms since epoch
  read: boolean;
}

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  clearAll: () => void;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem("knot_user");
    if (raw) {
      const u = JSON.parse(raw) as { id?: string };
      if (u.id) return u.id;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Legacy localStorage key — kept for backward compat so existing stored
 * notifications are not lost if the backend is unavailable.
 */
function getLocalStorageKey(userId: string | null): string {
  return userId ? `knot_notifs_${userId}` : "knot_notifications_v2";
}

function loadLocalNotifications(userId: string | null): Notification[] {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as Notification[];
  } catch {
    return [];
  }
}

function saveLocalNotifications(
  userId: string | null,
  notifications: Notification[],
): void {
  try {
    localStorage.setItem(
      getLocalStorageKey(userId),
      JSON.stringify(notifications),
    );
  } catch {
    // ignore
  }
}

/**
 * Add a notification directly to a SPECIFIC user's localStorage store.
 * Used as a fallback when the backend is unavailable.
 */
export function addNotificationForUser(
  targetUserId: string,
  n: Omit<Notification, "id" | "timestamp" | "read">,
): void {
  const key = `knot_notifs_${targetUserId}`;
  const newNotif: Notification = {
    ...n,
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    read: false,
  };
  try {
    const raw = localStorage.getItem(key);
    const existing: Notification[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(key, JSON.stringify([newNotif, ...existing]));
  } catch {
    // ignore
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const userId = getCurrentUserId();

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadLocalNotifications(userId),
  );

  // Track SSE connection
  const eventSourceRef = useRef<EventSource | null>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load initial notifications from backend + set up SSE ──────────────
  useEffect(() => {
    if (!userId) return;

    // 1. Load historical notifications from backend REST
    api
      .getNotifications(userId)
      .then((serverNotifs) => {
        setNotifications((prev) => {
          // Merge server notifications with any local ones that may not be on server
          const serverIds = new Set(serverNotifs.map((n) => n.id));
          const localOnly = prev.filter((n) => !serverIds.has(n.id));
          const merged = [...serverNotifs, ...localOnly].sort(
            (a, b) => b.timestamp - a.timestamp,
          );
          saveLocalNotifications(userId, merged);
          return merged;
        });
      })
      .catch(() => {
        // Backend unavailable — use local storage only
      });

    // 2. Connect SSE stream for real-time push
    function connectSSE() {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const url = api.getNotificationStreamUrl(userId!);
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener("notification", (e: MessageEvent) => {
        try {
          const notif = JSON.parse(e.data) as Notification;
          setNotifications((prev) => {
            // Avoid duplicates
            if (prev.some((n) => n.id === notif.id)) return prev;
            const updated = [notif, ...prev];
            saveLocalNotifications(userId, updated);
            return updated;
          });
        } catch {
          // ignore malformed event
        }
      });

      es.onerror = () => {
        // SSE dropped — fall back to polling until reconnect
        es.close();
        eventSourceRef.current = null;
        startFallbackPolling();
        // Try reconnecting after 10 seconds
        setTimeout(connectSSE, 10000);
      };

      // Clear fallback polling if SSE is alive
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    }

    function startFallbackPolling() {
      if (fallbackIntervalRef.current) return; // already polling
      fallbackIntervalRef.current = setInterval(() => {
        api
          .getNotifications(userId!)
          .then((serverNotifs) => {
            setNotifications((prev) => {
              if (JSON.stringify(prev) === JSON.stringify(serverNotifs))
                return prev;
              saveLocalNotifications(userId, serverNotifs);
              return serverNotifs;
            });
          })
          .catch(() => {});
      }, 5000);
    }

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [userId]);

  // ── Sync localStorage when notifications change ───────────────────────
  useEffect(() => {
    saveLocalNotifications(userId, notifications);
  }, [notifications, userId]);

  // ── Listen for cross-tab localStorage changes ────────────────────────
  useEffect(() => {
    const handleStorage = () => {
      setNotifications(loadLocalNotifications(userId));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (userId) {
      api.markNotificationsRead(userId).catch(() => {});
    }
  }, [userId]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    if (userId) {
      api.clearNotifications(userId).catch(() => {});
    }
  }, [userId]);

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotif: Notification = {
        ...n,
        id: `n-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timestamp: Date.now(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    [],
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllRead,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside <NotificationsProvider>",
    );
  return ctx;
}
