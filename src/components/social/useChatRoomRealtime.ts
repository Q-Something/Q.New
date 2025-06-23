
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Callback = () => void;

export function useChatRoomRealtime(roomId: string, onChange: Callback) {
  const latestCallback = useRef(onChange);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Always use the latest callback
  useEffect(() => { 
    latestCallback.current = onChange; 
  }, [onChange]);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;

    // Clean up any existing channel first
    cleanup();

    let cancelled = false;
    
    const channel = supabase
      .channel(`room-${roomId}-realtime`, {
        config: {
          broadcast: { self: true },
          presence: { key: roomId }
        }
      })
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'chat_messages_new', 
          filter: `room_id=eq.${roomId}` 
        },
        (payload) => {
          console.log('Real-time message update:', payload);
          if (!cancelled && latestCallback.current) {
            // Small delay to ensure database consistency
            setTimeout(() => latestCallback.current(), 100);
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'message_reactions' 
        },
        (payload) => {
          console.log('Real-time reaction update:', payload);
          if (!cancelled && latestCallback.current) {
            setTimeout(() => latestCallback.current(), 100);
          }
        }
      )
      .on(
        'broadcast',
        { event: 'message_sent' },
        (payload) => {
          console.log('Broadcast message received:', payload);
          if (!cancelled && latestCallback.current) {
            latestCallback.current();
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          if (!cancelled) {
            toast.error("Connection lost. Reconnecting...");
          }
        }
      });

    channelRef.current = channel;

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [roomId, cleanup]);

  return { isConnected };
}
