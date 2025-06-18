
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

export function useQSparkData() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>([]);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCurrentProfile();
      loadSuggestions();
      loadChatRooms();
    }
    // eslint-disable-next-line
  }, [user]);

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
    } catch (error) {
      console.error("Error loading chat rooms:", error);
    }
  }, []);

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
