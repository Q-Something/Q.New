
import { useState } from "react";
import { Smile } from "lucide-react";
import { ChatMessage } from "@/lib/api/social-api";

interface EmojiReactionBarProps {
  reactions: { emoji: string; users: string[] }[];
  message: ChatMessage;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
}

export default function EmojiReactionBar({
  reactions,
  message,
  currentUserId,
  onReact,
}: EmojiReactionBarProps) {
  const [showUsers, setShowUsers] = useState<string | null>(null);

  if (!reactions || !reactions.length) return null;
  return (
    <div className="flex gap-1 mt-1 ml-1 flex-wrap">
      {reactions.map((r, idx) => (
        <div key={r.emoji}
          className="relative group cursor-pointer px-1 py-0.5 bg-muted rounded text-lg flex items-center"
          tabIndex={0}
          title={
            r.users.length === 1
              ? `Reacted: ${r.users[0]}`
              : `Reacted: ${r.users.length} users`
          }
          onClick={() => onReact(message.id, r.emoji)}
          onMouseEnter={() => setShowUsers(r.emoji)}
          onMouseLeave={() => setShowUsers(null)}
        >
          {r.emoji}
          {r.users.length > 1 && (
            <span className="ml-1 text-xs font-bold">{r.users.length}</span>
          )}
          {showUsers === r.emoji && (
            <div className="absolute bottom-full mb-1 left-0 bg-popover text-popover-foreground rounded shadow p-1 text-xs z-50 whitespace-nowrap min-w-[80px]">
              {r.users.length > 0 ? (
                <ul>
                  {r.users.map((u) => (
                    <li key={u}>{u === currentUserId ? "You" : u}</li>
                  ))}
                </ul>
              ) : (
                <span>No users</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
