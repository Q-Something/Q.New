import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Callback = () => void;

export function useChatRoomRealtime(roomId: string, onChange: Callback) {
  const latestCallback = useRef(onChange);
  const [isConnected, setIsConnected] = useState(false);

  // Always use the latest callback
  useEffect(() => { latestCallback.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;
    const channel = supabase
      .channel(`room-${roomId}-realtime`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_messages_new', filter: `room_id=eq.${roomId}` },
        () => {
          if (!cancelled && latestCallback.current) latestCallback.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        () => {
          if (!cancelled && latestCallback.current) latestCallback.current();
        }
      )
      .on(
        'broadcast',
        { event: 'reload' },
        () => {
          if (!cancelled && latestCallback.current) latestCallback.current();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED' || status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          toast.error("Realtime connection lost. Retrying...");
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [roomId]);

  return { isConnected };
}
