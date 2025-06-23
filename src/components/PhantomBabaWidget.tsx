
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

const WIDGET_SIZE = 64;

// Helper for fetching the active quote from Supabase
const useActiveQuote = () => {
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchQuote = async () => {
      const { data, error } = await supabase
        .from("motivational_quotes")
        .select("quote")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (!ignore) setQuote(data?.[0]?.quote ?? null);
    };
    fetchQuote();
    return () => { ignore = true };
  }, []);

  return quote;
};

export const PhantomBabaWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const quote = useActiveQuote();

  // Prevent background scroll during modal
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Animations
  const modalAnim = open
    ? "animate-fade-in animate-scale-in"
    : "";

  return (
    <>
      {/* Floating Widget - Hidden on mobile when bottom nav is present */}
      <div className="fixed z-[990] bottom-20 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end md:block"
        style={{ pointerEvents: open ? "none" : "auto" }}
      >
        {/* Tooltip / Speech bubble */}
        {!open && showTooltip && (
          <div
            className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg rounded-lg px-4 py-2 mb-2 max-w-xs border border-gray-200 dark:border-gray-700 text-sm md:text-base leading-tight animate-fade-in`}
            style={{ fontFamily: "Quicksand, Inter, sans-serif" }}
          >
            <span className="select-none">
              ➤ Feeling demotivated? Meet <span className="italic font-semibold text-blue-600 dark:text-blue-400">Phantom Baba</span> <span role="img" aria-label="ghost">👻</span>
            </span>
          </div>
        )}
        {/* Avatar Button */}
        <button
          aria-label="Open Phantom Baba"
          className="rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-blue-300 dark:border-blue-700 p-1 flex items-center justify-center
            hover:scale-110 transition-transform relative overflow-hidden
            focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ width: WIDGET_SIZE, height: WIDGET_SIZE }}
          onClick={() => setOpen(true)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <img
            src="/saint.png"
            alt="Phantom Baba Icon"
            className="w-full h-full rounded-full object-cover"
            draggable={false}
            style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.11))" }}
          />
        </button>
      </div>

      {/* Full-screen Modal and Speech Bubble */}
      {open && (
        <div
          className={`fixed inset-0 z-[1100] flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-100 animate-fade-in`}
          style={{ fontFamily: "Quicksand, Inter, sans-serif" }}
          onClick={() => setOpen(false)}
        >
          {/* Bubble content centered */}
          <div
            className={`
              relative bg-white/95 rounded-3xl shadow-2xl p-8 py-12 max-w-lg w-[96vw] min-w-[290px] border border-blue-100 flex flex-col items-center
              animate-scale-in
            `}
            style={{
              boxShadow: "0 10px 36px rgba(0,0,60,0.14)",
              transition: "transform .24s cubic-bezier(.7,1.9,.5,1)",
              position: "relative",
              cursor: "auto",
            }}
            onClick={e => e.stopPropagation()} // Prevent overlay close when clicking bubble
          >
            {/* Close Button */}
            <button
              aria-label="Close Motivation"
              className="absolute top-3 right-3 text-gray-400 hover:text-pink-500 text-[22px] rounded-md p-1 bg-white/90 transition-colors focus:outline-none"
              onClick={() => setOpen(false)}
            >
              <X />
            </button>
            {/* Saint Avatar */}
            <img
              src="/saint.png"
              alt="Phantom Baba"
              className="w-16 h-16 rounded-full border-2 border-blue-200 shadow mb-3"
              style={{ background: "rgba(255,255,255,0.7)", marginTop: -35 }}
              draggable={false}
            />
            {/* Big Speech Bubble */}
            <div className="flex flex-col items-center">
              <div
                className="
                  px-6 py-4 rounded-full border border-blue-200 bg-blue-50 text-gray-800 font-semibold text-lg shadow
                "
                style={{
                  minWidth: "200px",
                  minHeight: "60px",
                  marginBottom: "8px",
                  fontFamily: "Quicksand, Inter, sans-serif"
                }}
              >
                {quote
                  ? (<span>{quote}</span>)
                  : (<span className="text-gray-400 italic">Phantom Baba will bless you with motivation soon...</span>)
                }
              </div>
              <div className="text-base text-blue-700 font-bold mt-2">
                – Phantom Baba 👻
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
