
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/context/auth-context";

const RECHECK_INTERVAL = 3 * 60 * 1000; // 3 minutes
const BANNER_REAPPEAR_MS = 60 * 1000; // 1 minute after close

interface NotificationStatus {
  incompleteTestCount: number;
  unreadMessageCount: number;
}

// Prevent React Hook order bugs: never call a hook conditionally!
export function useNotifications() {
  const { user } = useAuth();
  const [status, setStatus] = useState<NotificationStatus>({ incompleteTestCount: 0, unreadMessageCount: 0 });
  const [showTest, setShowTest] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const testBannerTimeout = useRef<NodeJS.Timeout>();
  const messageBannerTimeout = useRef<NodeJS.Timeout>();

  // Fetch incomplete tests/quizzes and unread messages
  async function fetchIncomplete() {
    try {
      if (!user) {
        setStatus({ incompleteTestCount: 0, unreadMessageCount: 0 });
        setShowTest(false); setShowMessage(false);
        return;
      }
      // Get user's class/stream
      const { data: pData } = await supabase.from("profiles").select("class, stream").eq("id", user.id).maybeSingle();

      // 1. Incomplete tests/quizzes for today (not expired and not already submitted)
      let testCount = 0;
      if (pData?.class && pData?.stream) {
        const classVal = pData.class;
        const streamVal = pData.stream;
        const { data: tests } = await supabase
          .from("study_tests")
          .select("id, expiry_at")
          .gt("expiry_at", new Date().toISOString())
          .eq("class", classVal)
          .eq("stream", streamVal);
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
        testCount = testIds.filter((id: string) => !submittedTestIds.includes(id)).length;
      }

      // 2. Unread messages using chat_messages_new (is_read = false for unread)
      let unreadCount = 0;
      const { data: rooms } = await supabase
        .from("chat_rooms")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
      const roomIds = (rooms ?? []).map((r: any) => r.id);
      if (roomIds.length > 0) {
        const { data: messages } = await supabase
          .from("chat_messages_new")
          .select("id, is_read, sender_id, room_id")
          .in("room_id", roomIds)
          .neq("sender_id", user.id)
          .eq("is_read", false);
        unreadCount = (messages ?? []).length;
      }

      setStatus({ incompleteTestCount: testCount, unreadMessageCount: unreadCount });
      setShowTest(testCount > 0);
      setShowMessage(unreadCount > 0);
    } catch (err) {
      // Log errors but don't crash the UI!
      console.error("Error in useNotifications > fetchIncomplete:", err);
    }
  }

  // Initial fetch and refresh at interval
  useEffect(() => {
    fetchIncomplete();
    const interval = setInterval(fetchIncomplete, RECHECK_INTERVAL);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [user?.id]);

  // Listen to real-time changes in unread messages and quiz submissions
  useEffect(() => {
    if (!user) return;
    try {
      const channel = supabase
        .channel(`notifications-realtime-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chat_messages_new' },
          payload => {
            fetchIncomplete();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'study_test_submissions' },
          () => {
            fetchIncomplete();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.error("Error in useNotifications > useEffect subscribe:", e);
    }
    // eslint-disable-next-line
  }, [user?.id]);

  // Dismiss handlers with auto reappear
  const handleDismissTest = () => {
    setShowTest(false);
    clearTimeout(testBannerTimeout.current);
    testBannerTimeout.current = setTimeout(() => {
      if (status.incompleteTestCount > 0) setShowTest(true);
    }, BANNER_REAPPEAR_MS);
  };
  const handleDismissMessage = () => {
    setShowMessage(false);
    clearTimeout(messageBannerTimeout.current);
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
    refresh: fetchIncomplete
  };
}
