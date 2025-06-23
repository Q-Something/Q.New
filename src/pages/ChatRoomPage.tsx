
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChatRoom } from "@/components/social/ChatRoom";
import { getChatRooms, ChatRoom as ChatRoomType } from "@/lib/api/social-api";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";

const ChatRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<ChatRoomType | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId || !user) return;
      const allRooms = await getChatRooms();
      const found = allRooms.find((r) => r.id === roomId);
      if (found) setRoom(found);
      else navigate("/q-spark"); // Fallback if not found
    };
    fetchRoom();
  }, [roomId, user, navigate]);

  if (!room || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-muted">
        <p className="text-muted-foreground">Loading chat room...</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/q-spark")}>
          Back to Q.Spark
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <ChatRoom roomId={room.id} otherUser={room.other_user!} currentUserId={user.id} fullScreen />
    </div>
  );
};

export default ChatRoomPage;
