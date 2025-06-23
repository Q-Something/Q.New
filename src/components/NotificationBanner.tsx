
import React from "react";
import { BellDot, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BannerType = "test" | "message";

interface NotificationBannerProps {
  show: boolean;
  type: BannerType;
  message: string;
  linkText: string;
  onClickLink?: () => void;
  onClose?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  show,
  type,
  message,
  linkText,
  onClickLink,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed top-0 inset-x-0 z-[999] flex items-center justify-center px-4 py-2 shadow-lg transition-all",
      type === "test" ? "bg-yellow-100 text-yellow-900" : "bg-blue-100 text-blue-900"
    )}>
      <div className="flex items-center gap-2">
        {type === "test" ? <BellDot className="w-5 h-5 text-yellow-600" /> : <MessageCircle className="w-5 h-5 text-blue-600" />}
        <span>{message}</span>
        <Button
          variant="link"
          className={type === "test" ? "text-yellow-700" : "text-blue-800"}
          onClick={onClickLink}
        >
          {linkText}
        </Button>
      </div>
      <button
        className="ml-4 text-xl px-2 rounded-md hover:bg-black/10 transition"
        aria-label="Dismiss"
        onClick={onClose}
      >
        &times;
      </button>
    </div>
  );
};
