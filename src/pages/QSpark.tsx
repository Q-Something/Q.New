import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { QSparkHeader } from "@/components/q-spark/QSparkHeader";
import { QSparkTabs } from "@/components/q-spark/QSparkTabs";
import { useQSparkData } from "@/hooks/useQSparkData";
import { createOrGetChatRoom } from "@/lib/api/social-api";
import { QSparkHomeDashboard } from "@/components/q-spark/QSparkHomeDashboard";

// The main QSpark page
const QSpark = () => {
  const {
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
  } = useQSparkData();

  const navigate = useNavigate();

  // Profile click logic
  const handleProfileClick = () => {
    if (!user) {
      toast.error("Please login to access your profile", {
        action: {
          label: "Login",
          onClick: () => {
            window.location.href = "/auth";
          },
        },
      });
    } else {
      window.location.href = "/profile";
    }
  };

  // When a user sparks or unsparks, refresh related data
  const handleFollowToggled = () => {
    loadSuggestions();
    if (searchResults.length > 0) {
      const lastQuery = new URLSearchParams(window.location.search).get('q');
      if (lastQuery) {
        handleSearch(lastQuery);
      }
    }
    loadCurrentProfile();
  };

  const handleMessageClick = async (profile: any) => {
    try {
      const roomId = await createOrGetChatRoom(profile.id);
      navigate(`/q-spark/chat/${roomId}`);
    } catch (error) {
      console.error("Error creating chat room:", error);
      toast.error("Failed to start chat");
    }
  };

  const handleChatRoomClick = (room: any) => {
    navigate(`/q-spark/chat/${room.id}`);
  };

  if (!user) {
    return (
      <div className="container py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">
            <span className="text-blue-500">Q</span>
            <span className="text-white">.Spark</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            Connect with study partners and build your learning community
          </p>
          <button 
            className="btn btn-lg"
            onClick={handleProfileClick}
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <QSparkHeader currentProfile={currentProfile} onProfileClick={handleProfileClick} />
        <QSparkTabs
          profiles={profiles}
          searchResults={searchResults}
          chatRooms={chatRooms}
          isLoading={isLoading}
          handleSearch={handleSearch}
          handleFollowToggled={handleFollowToggled}
          handleMessageClick={handleMessageClick}
          handleChatRoomClick={handleChatRoomClick}
          loadSuggestions={loadSuggestions}
          currentProfile={currentProfile}
          onProfileClick={handleProfileClick}
        />
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">About Q.Spark</h3>
          <p className="text-muted-foreground">
            Q.Spark is your social study platform where you can connect with like-minded students,
            find study partners, and build meaningful learning relationships. Use the Spark system
            to connect with others and chat with your study buddies in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QSpark;
