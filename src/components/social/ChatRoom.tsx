// ✅ same imports as before...
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChatMessage,
  UserProfile,
  getMessages,
  sendMessage,
  addReaction,
  markMessagesAsRead,
} from "@/lib/api/social-api";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { EmojiPicker } from "./EmojiPicker";
import { useNavigate } from "react-router-dom";
import MessageItem from "./MessageItem";
import { useChatRoomRealtime } from "./useChatRoomRealtime";
import { Badge } from "@/components/ui/badge";

interface ChatRoomProps {
  roomId: string;
  otherUser: UserProfile;
  currentUserId: string;
  fullScreen?: boolean;
}

const debounce = (fn: Function, delay = 300) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export function ChatRoom({ roomId, otherUser, currentUserId, fullScreen = false }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | undefined>("");
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("disconnected");
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (!scrollAreaRef.current) return;
    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  };

  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const msgs = await getMessages(roomId);
      setMessages(msgs);
      debouncedMarkAsRead();
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast.error("Failed to load messages.");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  const debouncedMarkAsRead = useCallback(
    debounce(() => {
      if (currentUserId) markMessagesAsRead(roomId);
    }, 500),
    [roomId, currentUserId]
  );

  const { isConnected } = useChatRoomRealtime(roomId, async () => {
    const updatedMsgs = await getMessages(roomId);
    setMessages(updatedMsgs);
    debouncedMarkAsRead();
  });

  useEffect(() => {
    setConnectionStatus(isConnected ? "connected" : "disconnected");
  }, [isConnected]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!highlightId && messages.length > 0) {
      setTimeout(scrollToBottom, 50);
    }
  }, [messages, highlightId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: ChatMessage = {
      id: tempId,
      room_id: roomId,
      sender_id: currentUserId,
      content: messageContent,
      message_type: "text",
      is_read: true,
      created_at: new Date().toISOString(),
      sender: {
        id: currentUserId,
        display_name: "You",
        username: "",
        uid: "",
        age: null,
        class: null,
        education: null,
        hobbies: null,
        exam_prep: null,
        instagram: null,
        discord: null,
        avatar_url: null,
        followers_count: 0,
        following_count: 0,
        mutual_sparks_count: 0,
      },
      reply_to: replyTo?.id || null,
      reply_to_message: replyTo || null,
      reactions: [],
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");
    setReplyTo(null);
    scrollToBottom();

    try {
      setIsSending(true);
      const realMessage = await sendMessage(roomId, messageContent, { replyTo });
     setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? realMessage : msg))
      ); 
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (emoji === "PICKER") {
      setReactionPickerMsgId(messageId);
      return;
    }
    try {
      await addReaction(messageId, emoji);
      setReactionPickerMsgId(null);
      toast.success("Reacted!");
      loadMessages();
    } catch (error) {
      toast.error("Failed to react");
    }
  };

  const handleReplyTo = (msg: ChatMessage) => {
    setReplyTo(msg);
    setTimeout(scrollToBottom, 10);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleScrollTo = (msgId: string) => {
    setHighlightId(msgId);
    const domId = `msg-${msgId}`;
    setTimeout(() => {
      const elm = document.getElementById(domId);
      if (elm) {
        elm.scrollIntoView({ behavior: "smooth", block: "center" });
        elm.classList.add("ring-2", "ring-blue-400", "ring-offset-2", "bg-blue-50");
        setTimeout(() => elm.classList.remove("ring-2", "ring-blue-400", "ring-offset-2", "bg-blue-50"), 1500);
      }
    }, 50);
    setTimeout(() => setHighlightId(""), 1600);
  };

  return (
    <div className={`flex flex-col ${fullScreen ? "h-screen bg-background" : "h-full"} w-full`}>
      {/* Top Bar */}
      <div className="border-b p-4 flex items-center gap-3 bg-muted relative">
        <Button type="button" size="icon" variant="ghost" className="mr-2" onClick={() => navigate("/q-spark")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="h-10 w-10">
          {otherUser.avatar_url ? (
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.display_name} />
          ) : (
            <AvatarFallback>{otherUser.display_name?.substring(0, 2).toUpperCase() || "ST"}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{otherUser.display_name}</h3>
          <p className="text-sm text-muted-foreground">@{otherUser.uid}</p>
        </div>
        <div>
          {connectionStatus === "connected" ? (
            <Badge variant="default" className="ml-4 bg-green-500/10 text-green-800">Connected</Badge>
          ) : (
            <Badge variant="outline" className="ml-4 bg-red-500/10 text-red-800">Offline</Badge>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-background">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUserId={currentUserId}
                otherUser={otherUser}
                onReply={handleReplyTo}
                onAddReaction={handleAddReaction}
                isOwn={message.sender_id === currentUserId}
                isHighlighted={highlightId === message.id}
                scrollIntoViewOnMount={false}
              />
            ))
          )}
        </div>

        {reactionPickerMsgId && (
          <div className="fixed z-50 bottom-36 left-1/2 transform -translate-x-1/2">
            <EmojiPicker
              onSelect={(emoji) => {
                if (reactionPickerMsgId) handleAddReaction(reactionPickerMsgId, emoji);
              }}
              onClose={() => setReactionPickerMsgId(null)}
            />
          </div>
        )}
      </ScrollArea>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2 bg-background relative">
        {replyTo && (
          <div
            className="absolute left-4 -top-10 flex bg-muted rounded px-2 py-1 items-center gap-2 max-w-[80%] z-10 cursor-pointer"
            onClick={() => handleScrollTo(replyTo.id)}
          >
            <span className="font-semibold">{replyTo.sender?.display_name || "User"}:</span>
            <span className="truncate">{replyTo.content}</span>
            <button type="button" className="ml-2 text-xs text-red-500" onClick={handleCancelReply}>
              ✕
            </button>
          </div>
        )}
        <Button type="button" variant="outline" size="icon" className="relative" onClick={() => setShowEmojiPicker((e) => !e)}>
          😊
          {showEmojiPicker && (
            <div className="absolute left-0 bottom-10 z-50">
              <EmojiPicker
                onSelect={(emoji) => {
                  setNewMessage((curr) => curr + emoji);
                  setShowEmojiPicker(false);
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}
        </Button>
        <Input
          placeholder="Type Q.Something?..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
          className="flex-1"
        />
        <Button type="submit" disabled={!newMessage.trim() || isSending} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
