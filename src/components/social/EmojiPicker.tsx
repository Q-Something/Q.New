
import { useState, useMemo } from "react";

const emojiList = [
  // Faces
  "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😍","😘","🥰","😋","😜","🤪","🤗","😎","🤩","🥳","🥺","😭",
  // Hearts & gestures
  "👍","👎","👏","🙏","🙌","🤝","✌️","👌","🤞","🤟","🫶","❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❣️","💕","💞","💖",
  // Animals/objects
  "🐶","🐱","🐼","🐻","🐨","🐯","🐸","🐵","🐧","🐤","🐦","🦆","🦄","🐝","🐛","🦋","🌸","🌻","🌞","🌙",
  // Activities/misc
  "🔥","🎉","🥳","🍀","🌈","⚡","⭐","💯","🎓","📚","🎵","🏆","🍕","🍔","🍟","🍣","🍦",
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}
export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      emojiList.filter((e) =>
        e.includes(search)
      ),
    [search]
  );
  // Tailwind: bg-popover adapts to theme, border, shadow, rounded, p-2, w-60/56
  return (
    <div className="absolute z-40 bg-popover border rounded shadow p-2 w-56 max-w-[90vw] transition-colors">
      <input
        className="w-full border rounded p-1 mb-2 bg-background text-foreground"
        placeholder="Search emoji"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-8 gap-1 max-h-56 overflow-y-auto">
        {(filtered.length ? filtered : emojiList).map((emoji) => (
          <button
            key={emoji}
            className="text-2xl p-1 hover:bg-muted rounded transition"
            type="button"
            onClick={() => {
              onSelect(emoji);
              if (onClose) onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
