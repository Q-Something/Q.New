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
      const { data: rooms } = await supabase
        .from("chat_rooms")
        .select("id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const roomIds = (rooms ?? []).map(r => r.id);

      if (roomIds.length > 0) {
        const { count } = await supabase
          .from("chat_messages_new")
          .select("*", { count: "exact", head: true })
          .in("room_id", roomIds)
          .neq("sender_id", user.id)
          .eq("is_read", false);

        unreadCount = count || 0;
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

    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages_new" },
        (payload) => {
          console.log("Realtime message change:", payload);
          setTimeout(fetchIncomplete, 1000);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "study_test_submissions" },
        () => {
          console.log("Realtime test submission change");
          setTimeout(fetchIncomplete, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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
    refresh: fetchIncomplete,
  };
}
