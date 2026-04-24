"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
// ✨ 1. เพิ่ม Import สำหรับส่งข้อมูลสถิติ
import { sendGAEvent } from '@next/third-parties/google'; 

const days = [
  { label: "MON", value: "monday", thai: "จันทร์" },
  { label: "TUE", value: "tuesday", thai: "อังคาร" },
  { label: "WED", value: "wednesday", thai: "พุธ" },
  { label: "THU", value: "thursday", thai: "พฤหัสบดี" },
  { label: "FRI", value: "friday", thai: "ศุกร์" },
  { label: "SAT", value: "saturday", thai: "เสาร์" },
  { label: "SUN", value: "sunday", thai: "อาทิตย์" },
];

export default function UpdateSchedule({ allManga, onMangaClick }: any) {
  const todayIndex = new Date().getDay();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const [selectedDay, setSelectedDay] = useState(dayNames[todayIndex]);

  // ✨ 2. ฟังก์ชันเปลี่ยนวันพร้อมเก็บสถิติ
  const handleDayChange = (dayValue: string) => {
    setSelectedDay(dayValue);
    sendGAEvent('event', 'check_schedule_day', { day: dayValue });
  };

  // ✨ 3. ฟังก์ชันคลิกมังฮวาพร้อมเก็บสถิติ
  const handleMangaClick = (m: any) => {
    sendGAEvent('event', 'schedule_item_click', { 
      manga_title: m.title,
      day: selectedDay 
    });
    onMangaClick(m);
  };

  const filteredManga = allManga.filter((m: any) => m.updateDay === selectedDay);

  // ✨ Helper เช็คสถานะจบ
  const isMangaCompleted = (status: string) => 
    status === 'completed' || 
    status === '✅ แปลจบแล้ว (Completed)' || 
    status === 'จบแล้ว';

  return (
    <div className="w-full bg-[#0D0D0D] border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Decor (สีชมพูสาววาย) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[50px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-500/10 rounded-xl border border-pink-500/20 text-pink-500 shadow-lg">
            <Calendar size={20} />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">ตารางการลงงาน</h2>
        </div>
        <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hidden sm:block">
          สาววายขอแปล Timeline
        </div>
      </div>

      {/* Day Selector (Pink Theme) */}
      <div className="flex justify-between gap-1.5 mb-8 overflow-x-auto no-scrollbar pb-2">
        {days.map((day) => (
          <button
            key={day.value}
            onClick={() => handleDayChange(day.value)}
            className={`flex-1 min-w-[65px] py-3.5 rounded-2xl text-[10px] font-black transition-all duration-300 ${
              selectedDay === day.value 
              ? "bg-pink-600 text-white shadow-[0_10px_20px_-5px_rgba(236,72,153,0.5)] scale-105 border border-white/10" 
              : "bg-white/[0.03] text-gray-500 hover:bg-white/10 border border-transparent"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Manga List in Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <AnimatePresence mode="wait">
          {filteredManga.length > 0 ? (
            filteredManga.map((m: any) => (
              <motion.div
                key={m.slug}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleMangaClick(m)}
                className="flex gap-4 p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-pink-500/10 hover:border-pink-500/20 transition-all cursor-pointer group shadow-lg"
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={m.coverUrl} 
                    className="w-16 h-22 object-cover rounded-xl shadow-xl border border-white/10 group-hover:scale-105 transition-transform duration-500" 
                    alt={m.title}
                  />
                  {/* ✨ แสดงป้ายจบแล้ว (Pink Style) */}
                  {isMangaCompleted(m.status) && (
                    <div className="absolute inset-0 bg-pink-600/40 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                      <span className="text-[8px] font-black text-white bg-pink-600 px-1.5 py-0.5 rounded shadow-lg uppercase">END</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <h4 className="text-[13px] font-bold text-gray-100 truncate uppercase italic leading-tight group-hover:text-pink-400 transition-colors">
                    {m.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black shadow-sm">
                      EP.{m.latestChapter || '??'}
                    </span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase flex items-center gap-1">
                      <Clock size={10} /> ลงทุกวัน{days.find(d => d.value === selectedDay)?.thai}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="col-span-full py-12 text-center text-gray-600 text-[11px] font-black uppercase italic tracking-[0.2em] border border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]"
            >
              วันนี้ยังไม่มีคิวลงงานน้าาา
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

