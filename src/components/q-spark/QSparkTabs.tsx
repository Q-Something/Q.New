
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Brain, MessageCircle, Home } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/social/SearchBar";
import { UserProfileCard } from "@/components/social/UserProfileCard";
import { ChatRoom } from "@/components/social/ChatRoom";
import { QSparkHomeDashboard } from "./QSparkHomeDashboard";

interface QSparkTabsProps {
  profiles: any[];
  searchResults: any[];
  chatRooms: any[];
  isLoading: boolean;
  handleSearch: (query: string) => void;
  handleFollowToggled: () => void;
  handleMessageClick: (profile: any) => void;
  handleChatRoomClick: (room: any) => void;
  loadSuggestions: () => void;
  currentProfile: any;
  onProfileClick: () => void;
}

export function QSparkTabs({
  profiles,
  searchResults,
  chatRooms,
  isLoading,
  handleSearch,
  handleFollowToggled,
  handleMessageClick,
  handleChatRoomClick,
  loadSuggestions,
  currentProfile,
  onProfileClick,
}: QSparkTabsProps) {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="home" className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </TabsTrigger>
        <TabsTrigger value="search" className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </TabsTrigger>
        <TabsTrigger value="suggestions" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span className="hidden sm:inline">Suggestions</span>
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Messages</span>
        </TabsTrigger>
      </TabsList>

      {/* Home Tab */}
      <TabsContent value="home" className="space-y-6">
        <QSparkHomeDashboard
          currentProfile={currentProfile}
          onProfileClick={onProfileClick}
          setActiveTab={setActiveTab}
        />
      </TabsContent>

      {/* Search Tab */}
      <TabsContent value="search" className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <SearchBar onSearch={handleSearch} placeholder="Search by UID (e.g., john123)" />
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.length > 0 ? (
              searchResults.map((profile: any) => (
                <UserProfileCard 
                  key={profile.id}
                  profile={profile}
                  onFollowToggled={handleFollowToggled}
                  onMessageClick={handleMessageClick}
                  showMessageButton={true}
                />
              ))
            ) : (
              <div className="col-span-3 flex justify-center items-center h-40 bg-muted/30 rounded-lg">
                <p className="text-center text-muted-foreground">
                  Use the search bar above to find students by their UID
                </p>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* Suggestions Tab */}
      <TabsContent value="suggestions" className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Smart Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Students matched based on your class, age, hobbies, and exam prep
              </p>
            </div>
            <button onClick={loadSuggestions} className="btn btn-outline">
              <Brain className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.length > 0 ? (
              profiles.map((profile: any) => (
                <UserProfileCard 
                  key={profile.id}
                  profile={profile}
                  onFollowToggled={handleFollowToggled}
                  onMessageClick={handleMessageClick}
                  showMessageButton={true}
                />
              ))
            ) : (
              <div className="col-span-3 flex justify-center items-center h-40 bg-muted/30 rounded-lg">
                <p className="text-center text-muted-foreground">
                  No suggestions found. Complete your profile to get better matches!
                </p>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      {/* Messages Tab */}
      <TabsContent value="messages" className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold">Your Conversations</h3>
          <p className="text-sm text-muted-foreground">
            Chat with your sparked friends
          </p>
        </div>
        <div className="space-y-4">
          {chatRooms.length > 0 ? (
            chatRooms.map((room: any) => (
              <div
                key={room.id}
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleChatRoomClick(room)}
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {room.other_user?.display_name?.substring(0, 2).toUpperCase() || 'ST'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{room.other_user?.display_name}</h4>
                  <p className="text-sm text-muted-foreground">@{room.other_user?.uid}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {room.last_message_at && (
                    <p>{new Date(room.last_message_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start sparking with other students to begin chatting!
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
