
import React from "react";
import { Coins } from "lucide-react";

export const RewardCoin: React.FC<{ animate?: boolean }> = ({ animate }) => (
  <span
    className={
      "inline-flex items-center justify-center rounded-full bg-yellow-100 border border-yellow-300 p-2 mr-2" +
      (animate ? " animate-bounce" : "")
    }
    style={{ minWidth: 36, minHeight: 36 }}
  >
    <Coins className="text-yellow-600" size={24} />
  </span>
);
