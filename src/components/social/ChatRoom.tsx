import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, UserProfile, getMessages, sendMessage, addReaction, markMessagesAsRead } from "@/lib/api/social-api";
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

export function ChatRoom({
  roomId,
  otherUser,
  currentUserId,
  fullScreen = false,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string|undefined>("");
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  // Optimistic message updates
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

  // Real-time integration with improved callback
  const reloadMessages = useCallback(async () => {
    try {
      const msgs = await getMessages(roomId);
      setMessages(msgs);
      setOptimisticMessages([]); // Clear optimistic messages when real data arrives
    } catch (err) {
      console.error("Failed to reload messages:", err);
    }
  }, [roomId]);

  const { isConnected } = useChatRoomRealtime(roomId, reloadMessages);

  // Initial load
  async function loadMessages() {
    setIsLoading(true);
    try {
      const msgs = await getMessages(roomId);
      setMessages(msgs);
    } catch (err) {
      toast.error("Failed to load messages.");
    } finally {
      setIsLoading(false);
    }
  }

  // Mark messages as read when chat is visible and focused
  useEffect(() => {
    if (roomId && currentUserId && isVisible && messages.length > 0) {
      const timer = setTimeout(() => {
        markMessagesAsRead(roomId);
      }, 500); // Small delay to ensure user has seen the messages

      return () => clearTimeout(timer);
    }
  }, [roomId, currentUserId, isVisible, messages.length]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => { 
    loadMessages(); 
  }, [roomId]);

  // Scroll to bottom on messages update
  useEffect(() => {
    if (!highlightId && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        setTimeout(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 100);
      }
    }
  }, [messages, optimisticMessages, highlightId]);

  // Sending message with optimistic updates
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update
    const optimisticMessage: ChatMessage = {
      id: tempId,
      room_id: roomId,
      sender_id: currentUserId,
      content: messageContent,
      message_type: 'text',
      is_read: false,
      created_at: new Date().toISOString(),
      sender: {
        id: currentUserId,
        display_name: 'You',
        username: '',
        uid: '',
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
        mutual_sparks_count: 0
      },
      reply_to: replyTo?.id || null,
      reply_to_message: replyTo,
      reactions: []
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
    setReplyTo(null);

    try {
      setIsSending(true);
      await sendMessage(roomId, messageContent, { replyTo });
      
      // Real message will arrive via real-time subscription
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageContent); // Restore message content
    } finally {
      setIsSending(false);
    }
  };

  // Reacting with emoji to a message
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (emoji === "PICKER") { // Open emoji picker for that message
      setReactionPickerMsgId(messageId);
      return;
    }
    try {
      await addReaction(messageId, emoji);
      setReactionPickerMsgId(null);
      toast.success("Reacted!");
    } catch (error) {
      toast.error("Failed to react");
    }
  };

  // Reply logic
  const handleReplyTo = (msg: ChatMessage) => {
    setReplyTo(msg);
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }, 10);
  };
  const handleCancelReply = () => { setReplyTo(null); };

  // Highlight/scrolling for quoted messages
  const handleScrollTo = (msgId: string) => {
    setHighlightId(msgId);
    const domId = `msg-${msgId}`;
    setTimeout(() => {
      const elm = document.getElementById(domId);
      if (elm) {
        elm.scrollIntoView({ behavior: "smooth", block: "center" });
        elm.classList.add("ring-2", "ring-blue-400", "ring-offset-2", "bg-blue-50");
        setTimeout(() => elm.classList.remove("ring-2","ring-blue-400","ring-offset-2","bg-blue-50"), 1500);
      }
    }, 50);
    setTimeout(() => setHighlightId(""), 1600);
  };

  // Combine real and optimistic messages
  const allMessages = [...messages, ...optimisticMessages];

  // ---- UI ----
  return (
    <div className={`flex flex-col ${fullScreen ? "h-screen bg-background" : "h-full"} w-full`}>
      {/* Chat Header + Back Button */}
      <div className="border-b p-4 flex items-center gap-3 bg-muted relative">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="mr-2"
          onClick={() => navigate("/q-spark")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="h-10 w-10">
          {otherUser.avatar_url ? (
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.display_name} />
          ) : (
            <AvatarFallback>
              {otherUser.display_name?.substring(0, 2).toUpperCase() || "ST"}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{otherUser.display_name}</h3>
          <p className="text-sm text-muted-foreground">@{otherUser.uid}</p>
        </div>
        <div>
          {isConnected ? (
            <Badge variant="default" className="ml-4 bg-green-500/10 text-green-800">Connected</Badge>
          ) : (
            <Badge variant="outline" className="ml-4 bg-red-500/10 text-red-800">Connecting...</Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-background">
        <div className="space-y-4">
          {allMessages.map((message) => (
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
          ))}
        </div>
        {/* Emoji Picker for reactions */}
        {reactionPickerMsgId && (
          <div className="fixed z-50 bottom-36 left-1/2 transform -translate-x-1/2">
            <EmojiPicker
              onSelect={emoji => {
                if (reactionPickerMsgId) handleAddReaction(reactionPickerMsgId, emoji);
              }}
              onClose={() => setReactionPickerMsgId(null)}
            />
          </div>
        )}
      </ScrollArea>

      {/* Message Input + Reply */}
      <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-2 bg-background relative">
        {replyTo && (
          <div className="absolute left-4 -top-10 flex bg-muted rounded px-2 py-1 items-center gap-2 max-w-[80%] z-10 cursor-pointer" onClick={() => handleScrollTo(replyTo.id)}>
            <span className="font-semibold">{replyTo.sender?.display_name || "User"}:</span>
            <span className="truncate">{replyTo.content}</span>
            <button type="button" className="ml-2 text-xs text-red-500" onClick={handleCancelReply}>✕</button>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => setShowEmojiPicker((e) => !e)}
        >
          😊
          {showEmojiPicker && (
            <div className="absolute left-0 bottom-10 z-50">
              <EmojiPicker onSelect={emoji => {
                setNewMessage(curr => curr + emoji);
                setShowEmojiPicker(false);
              }} onClose={() => setShowEmojiPicker(false)} />
            </div>
          )}
        </Button>
        <Input
          placeholder="Type a message..."
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