"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X } from "lucide-react";

export default function AnnouncementBar({ text }: { text: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted || !text) return null;

  const repeatedText = Array(10).fill(text);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          className="w-full bg-pink-600 border-b border-pink-400/30 text-white relative z-[9999] overflow-hidden"
        >
          <div className="flex items-center justify-between w-full relative">
            <div className="pl-4 pr-3 py-2 md:py-2.5 z-10 bg-pink-600 shadow-[15px_0_15px_-5px_rgba(219,39,119,1)]">
              <Megaphone size={16} className="shrink-0 animate-pulse text-pink-200" />
            </div>
            
            <div className="flex-1 overflow-hidden relative flex items-center h-full mask-edges">
              <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap items-center w-max">
                <div className="flex gap-8 px-4 w-max">
                  {repeatedText.map((t, i) => (<span key={`a-${i}`} className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t}</span>))}
                </div>
                <div className="flex gap-8 px-4 w-max">
                  {repeatedText.map((t, i) => (<span key={`b-${i}`} className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t}</span>))}
                </div>
              </div>
            </div>

            <div className="pr-4 pl-3 py-2 md:py-2.5 z-10 bg-pink-600 shadow-[-15px_0_15px_-5px_rgba(219,39,119,1)]">
              <button onClick={() => setIsVisible(false)} className="shrink-0 bg-black/10 hover:bg-black/20 p-1 rounded-full transition-colors flex items-center justify-center">
                <X size={14} />
              </button>
            </div>
          </div>
          <style jsx>{`
            .animate-marquee { animation: scrollText 40s linear infinite; }
            @keyframes scrollText { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

