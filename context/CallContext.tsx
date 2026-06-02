'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { connectSocket } from '../lib/socket-client';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  consultationId?: string;
  roomId?: string;
  isRead: boolean;
  createdAt: string;
}

interface CallState {
  callStarted: boolean;
  consultationId: string | null;
  roomId: string | null;
}

interface CallContextValue {
  callState: CallState;
  notifications: AppNotification[];
  unreadCount: number;
  setCallState: (patch: Partial<CallState>) => void;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  const [callState, setCallStateRaw] = useState<CallState>({
    callStarted:    false,
    consultationId: null,
    roomId:         null,
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);

  const setCallState = useCallback((patch: Partial<CallState>) => {
    setCallStateRaw(prev => ({ ...prev, ...patch }));
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch { /* network error — ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const socket = connectSocket(userId);

    socket.on('notification', (note: AppNotification) => {
      setNotifications(prev => [note, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('call-started', ({ consultationId, roomId }: { consultationId: string; roomId: string }) => {
      setCallState({ callStarted: true, consultationId, roomId });
      fetchNotifications();
    });

    socket.on('call-ended', () => {
      setCallState({ callStarted: false, consultationId: null, roomId: null });
      fetchNotifications();
    });

    return () => {
      socket.off('notification');
      socket.off('call-started');
      socket.off('call-ended');
    };
  }, [userId]);

  return (
    <CallContext.Provider
      value={{ callState, notifications, unreadCount, setCallState, fetchNotifications, markAllRead }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used inside <CallProvider>');
  return ctx;
}
