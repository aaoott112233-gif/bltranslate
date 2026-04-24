"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ExternalLink } from "lucide-react"; // ✨ เพิ่ม ExternalLink
import { sendGAEvent } from '@next/third-parties/google'; // ✨ 1. เรียกใช้งาน Analytics

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawUrl = searchParams.get("url");
  const [count, setCount] = useState(3);

  // ✨ 2. ส่งสถิติไป GA4 เมื่อเริ่มหน้า Redirect
  useEffect(() => {
    if (rawUrl) {
      sendGAEvent('event', 'outbound_click', { 
        destination_url: decodeURIComponent(rawUrl) 
      });
    }
  }, [rawUrl]);

  useEffect(() => {
    if (!rawUrl) { 
      router.push("/"); 
      return; 
    }

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = decodeURIComponent(rawUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rawUrl, router]);

  return (
    <div className="min-h-dvh w-full bg-[#050505] text-white flex items-center justify-center p-6 font-sans">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#111] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] max-w-[340px] w-full text-center relative overflow-hidden"
      >
        {/* ✨ ปรับสี Glow เป็น Indigo ให้เข้ากับแบรนด์ */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 blur-[50px] rounded-full" />
        
        <h2 className="text-xl md:text-2xl font-black mb-2 uppercase tracking-tighter italic text-indigo-100">
          กำลังเตรียมหน้าอ่าน...
        </h2>
        <p className="text-gray-500 text-[10px] mb-10 uppercase font-bold tracking-[0.2em] opacity-60">
          SECURE REDIRECTING
        </p>
        
        <div className="relative flex items-center justify-center mb-10">
           {/* ✨ ปรับตัวเลขเป็นสี Indigo */}
           <div className="text-7xl font-black text-indigo-500 tabular-nums drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
             {count}
           </div>
           <Loader2 className="absolute w-28 h-28 text-indigo-500/10 animate-spin" strokeWidth={1} />
           <motion.div 
             initial={{ rotate: 0 }}
             animate={{ rotate: 360 }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             className="absolute w-20 h-20 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full"
           />
        </div>

        <div className="space-y-6">
          {/* <p className="text-gray-400 text-[11px] leading-relaxed italic px-2 opacity-80">
            "สนับสนุนผู้แปลได้โดยการอ่านในช่องทางที่ถูกต้องนะครับ"
          </p> */}

          {/* ✨ 3. เพิ่มปุ่ม Fallback กรณีไม่เปลี่ยนหน้าอัตโนมัติ */}
          <button 
            onClick={() => { if(rawUrl) window.location.href = decodeURIComponent(rawUrl); }}
            className="w-full py-3.5 bg-white/[0.03] hover:bg-indigo-600 border border-white/5 hover:border-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
          >
            กดที่นี่หากไม่เปลี่ยนหน้า <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="pt-2">
            <span className="text-indigo-500/40 text-[10px] font-black tracking-[0.4em] uppercase">
              - TRANSLATELOVER -
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
           <motion.div 
             initial={{ width: "0%" }}
             animate={{ width: "100%" }}
             transition={{ duration: 3, ease: "linear" }}
             className="h-full bg-indigo-600"
           />
        </div>
      </motion.div>

      <div className="absolute bottom-8 w-full text-center">
         <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.5em]">
            Translating Love Beside The Pillow
         </p>
      </div>
    </div>
  );
}

export default function RedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}

