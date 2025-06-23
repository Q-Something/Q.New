import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Reply, Smile } from "lucide-react";
import EmojiReactionBar from "./EmojiReactionBar";
import { ChatMessage, UserProfile } from "@/lib/api/social-api";

interface MessageItemProps {
  message: ChatMessage;
  currentUserId: string;
  otherUser: UserProfile;
  onReply: (msg: ChatMessage) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  isOwn: boolean;
  isHighlighted?: boolean;
  scrollIntoViewOnMount?: boolean;
}

export default function MessageItem({
  message,
  currentUserId,
  otherUser,
  onReply,
  onAddReaction,
  isOwn,
  isHighlighted,
  scrollIntoViewOnMount
}: MessageItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollIntoViewOnMount && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [scrollIntoViewOnMount]);

  return (
    <div
      ref={ref}
      id={`msg-${message.id}`}
      className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} relative ${isHighlighted ? "ring-2 ring-blue-400 ring-offset-2 bg-blue-50" : ""} duration-200`}
      tabIndex={-1}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 order-1 mr-2 mt-auto">
          {otherUser.avatar_url ? (
            <AvatarImage src={otherUser.avatar_url} alt={otherUser.display_name} />
          ) : (
            <span className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-base font-bold">
              {otherUser.display_name?.[0]?.toUpperCase() || otherUser.email?.[0]?.toUpperCase() || "U"}
            </span>
          )}
        </Avatar>
      )}
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {/* Replied/Quoted message preview */}
        {message.reply_to_message && (
          <button
            className="mb-1 border-l-4 border-blue-400 pl-3 py-1 bg-muted text-xs text-muted-foreground rounded cursor-pointer hover:bg-blue-100 transition"
            onClick={() => {
              const q = document.getElementById(`msg-${message.reply_to_message.id}`);
              if (q) {
                q.scrollIntoView({ behavior: "smooth", block: "center" });
                q.classList.add("ring-2", "ring-blue-400", "ring-offset-2", "bg-blue-50");
                setTimeout(() => q.classList.remove("ring-2","ring-blue-400","ring-offset-2","bg-blue-50"), 1500);
              }
            }}
          >
            <span className="font-semibold">{message.reply_to_message.sender?.display_name || "User"}:</span> {message.reply_to_message.content}
          </button>
        )}
        <div
          className={`rounded-lg p-3 flex items-center relative ${
            isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        >
          <span className="flex-1 break-words">{message.content}</span>
          {/* Reaction trigger */}
          <Button
            type="button"
            title="Add Reaction"
            size="icon"
            variant="ghost"
            className="ml-2 opacity-0 group-hover:opacity-100 transition"
            onClick={(e) => {
              e.stopPropagation();
              onAddReaction(message.id, "PICKER"); // Triggers emoji picker in parent
            }}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        <EmojiReactionBar
          reactions={message.reactions || []}
          message={message}
          currentUserId={currentUserId}
          onReact={onAddReaction}
        />
        <div className="flex gap-2 text-xs text-muted-foreground mt-1 px-1">
          <span>{new Date(message.created_at).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span>
          <button
            type="button"
            className="flex items-center gap-1 hover:text-primary"
            onClick={() => onReply(message)}
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}
