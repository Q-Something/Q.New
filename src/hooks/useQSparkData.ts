import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { 
  getCurrentUserProfile, 
  searchUsersByUID, 
  getSmartSuggestions, 
  getChatRooms, 
  createOrGetChatRoom, 
  ChatRoom as ChatRoomType,
  UserProfile
} from "@/lib/api/social-api";
import { supabase } from "@/integrations/supabase/client";

export function useQSparkData() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [chatRooms, setChatRooms] = useState<(ChatRoomType & { unread_count: number })[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const loadCurrentProfile = useCallback(async () => {
    try {
      const profile = await getCurrentUserProfile();
      setCurrentProfile(profile);
    } catch (error) {
      console.error("Error loading current profile:", error);
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const suggestions = await getSmartSuggestions();
      setProfiles(suggestions);
    } catch (error) {
      console.error("Error loading suggestions:", error);
      toast.error("Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadChatRooms = useCallback(async () => {
    try {
      const rooms = await getChatRooms();
      setChatRooms(rooms);
      // Debug: log the order and timestamps after setting
      console.log('Frontend chatRooms order after refresh:');
      rooms.forEach(room => {
        console.log(`Room ${room.id} with user ${room.other_user?.display_name}: last_message_at = ${room.last_message_at}`);
      });
    } catch (error) {
      console.error("Error loading chat rooms:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadCurrentProfile();
      loadSuggestions();
      loadChatRooms();
    }
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Subscribe to chat_messages_new for inserts and updates
    const channel = supabase.channel('chat-messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages_new' }, (payload) => {
        console.log('Real-time event received:', payload);
        // On any new message or update, reload chat rooms
        loadChatRooms();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadChatRooms]);

  const handleSearch = async (query: string) => {
    try {
      setIsLoading(true);
      const results = await searchUsersByUID(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profiles,
    setProfiles,
    searchResults,
    setSearchResults,
    chatRooms,
    setChatRooms,
    currentProfile,
    setCurrentProfile,
    isLoading,
    setIsLoading,
    handleSearch,
    loadSuggestions,
    loadCurrentProfile,
    loadChatRooms,
    user,
  };
}
