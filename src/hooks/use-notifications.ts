import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/context/auth-context";

const RECHECK_INTERVAL = 2 * 60 * 1000; // 2 minutes
const BANNER_REAPPEAR_MS = 60 * 1000; // 1 minute

interface NotificationStatus {
  incompleteTestCount: number;
  unreadMessageCount: number;
}

export function useNotifications() {
  const { user } = useAuth();
  const [status, setStatus] = useState<NotificationStatus>({
    incompleteTestCount: 0,
    unreadMessageCount: 0,
  });
  const [showTest, setShowTest] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const testBannerTimeout = useRef<NodeJS.Timeout>();
  const messageBannerTimeout = useRef<NodeJS.Timeout>();
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);

  const fetchIncomplete = async () => {
    if (!user) {
      setStatus({ incompleteTestCount: 0, unreadMessageCount: 0 });
      setShowTest(false);
      setShowMessage(false);
      return;
    }

    try {
      // Get user's class and stream
      const { data: pData } = await supabase
        .from("profiles")
        .select("class, stream")
        .eq("id", user.id)
        .maybeSingle();

      let testCount = 0;
      if (pData?.class && pData?.stream) {
        const { data: tests } = await supabase
          .from("study_tests")
          .select("id, expiry_at")
          .gt("expiry_at", new Date().toISOString())
          .eq("class", pData.class)
          .eq("stream", pData.stream);

        const testIds = (tests ?? []).map((t: any) => t.id);
        let submittedTestIds: string[] = [];

        if (testIds.length > 0) {
          const { data: subs } = await supabase
            .from("study_test_submissions")
            .select("test_id")
            .eq("student_id", user.id)
            .in("test_id", testIds);

          submittedTestIds = (subs ?? []).map((r: any) => r.test_id);
        }

        testCount = testIds.filter(id => !submittedTestIds.includes(id)).length;
      }

              // Get unread message count (excluding user's own messages)
      let unreadCount = 0;
      try {
        // First, get all chat rooms where the current user is a participant
        const { data: rooms, error: roomsError } = await supabase
          .from("chat_rooms")
          .select("id")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (roomsError) {
          console.error('Error fetching chat rooms:', roomsError);
          throw roomsError;
        }
        
        const roomIds = (rooms ?? []).map(r => r.id);

        if (roomIds.length > 0) {
          // Count unread messages across all rooms
          const { count, error: countError } = await supabase
            .from("chat_messages_new")
            .select("*", { count: "exact", head: true })
            .in("room_id", roomIds)
            .neq("sender_id", user.id)
            .eq("is_read", false);

          if (countError) {
            console.error('Error counting unread messages:', countError);
            throw countError;
          }
          
          unreadCount = count || 0;
          console.log(`Found ${unreadCount} unread messages across ${roomIds.length} rooms`);
        } else {
          console.log('User is not part of any chat rooms');
        }
      } catch (error) {
        console.error('Error in fetchIncomplete:', error);
        // Don't update the state if there was an error
        return;
      }

      console.log("Notification counts - Tests:", testCount, "Messages:", unreadCount);

      setStatus({ incompleteTestCount: testCount, unreadMessageCount: unreadCount });
      setShowTest(testCount > 0);
      setShowMessage(unreadCount > 0);
    } catch (error) {
      console.error("Error in useNotifications > fetchIncomplete:", error);
    }
  };

  useEffect(() => {
    fetchIncomplete();
    const interval = setInterval(fetchIncomplete, RECHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    let channel: any = null;
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const setupChannel = () => {
      if (!isMounted) return;
      
      // Clean up any existing channel first
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.error('Error cleaning up channel:', e);
        }
      }

      console.log('Setting up real-time notifications channel');
      
      channel = supabase.channel(`notifications-realtime-${user.id}-${Date.now()}`);
      
      // Listen for new messages
      channel.on(
        'postgres_changes',
        { 
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages_new',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload: any) => {
          console.log('New message received:', payload);
          refreshUnreadCount();
        }
      );
      
      // Listen for message read updates
      channel.on(
        'postgres_changes',
        { 
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages_new',
          filter: `is_read=eq.true`
        },
        (payload: any) => {
          console.log('Message read status updated:', payload);
          refreshUnreadCount();
        }
      );
      
      // Listen for our custom broadcast events
      channel.on(
        'broadcast',
        { event: 'MESSAGES_READ' },
        (payload: any) => {
          console.log('Received MESSAGES_READ broadcast:', payload);
          refreshUnreadCount();
        }
      );
      
      // Listen for test submission changes
      channel.on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'study_test_submissions',
          filter: `student_id=eq.${user?.id}`
        },
        (payload: any) => {
          console.log('Test submission changed:', payload);
          refreshUnreadCount();
        }
      );

      // Define refresh function
      const refreshUnreadCount = () => {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = setTimeout(() => {
          if (user) {
            fetchIncomplete();
          }
        }, 500);
      };

      // Subscribe to the channel
      channel.subscribe((status) => {
        console.log('Channel status:', status);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CHANNEL_CLOSED') {
          // Try to reconnect after a delay
          setTimeout(() => {
            if (user) {
              console.log('Reconnecting channel...');
              setupChannel();
            }
          }, 5000);
        }
      });

      // Initial fetch
      refreshUnreadCount();
    };

    // Setup the channel
    setupChannel();

    // Cleanup function
    return () => {
      clearTimeout(timeoutIdRef.current);
      clearInterval(refreshIntervalRef.current);
      
      if (channelRef.current) {
        try {
          console.log('Cleaning up channel');
          supabase.removeChannel(channelRef.current);
        } catch (e) {
          console.error('Error cleaning up channel:', e);
        }
      }
    };
  }, [user?.id]);

  const handleDismissTest = () => {
    setShowTest(false);
    if (testBannerTimeout.current) {
      clearTimeout(testBannerTimeout.current);
    }
    testBannerTimeout.current = setTimeout(() => {
      if (status.incompleteTestCount > 0) setShowTest(true);
    }, BANNER_REAPPEAR_MS);
  };

  const handleDismissMessage = () => {
    setShowMessage(false);
    if (messageBannerTimeout.current) {
      clearTimeout(messageBannerTimeout.current);
    }
    messageBannerTimeout.current = setTimeout(() => {
      if (status.unreadMessageCount > 0) setShowMessage(true);
    }, BANNER_REAPPEAR_MS);
  };

  return {
    incompleteTestCount: status.incompleteTestCount,
    unreadMessageCount: status.unreadMessageCount,
    showTestBanner: showTest,
    showMessageBanner: showMessage,
    handleDismissTest,
    handleDismissMessage,
    refresh: fetchIncomplete,
  };
}
