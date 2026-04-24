"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { client } from "@/sanity/lib/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Flame, Crown, Zap, LayoutGrid, Shuffle, 
  ChevronLeft, ChevronRight, Plus, Square, Grid2X2, Grid3X3,
  Calendar, Clock, CheckCircle, ExternalLink
} from "lucide-react";
import { Toaster } from 'sonner';
import MangaCard from "@/components/MangaCard";
import MangaRow from "@/components/MangaRow";
import { sendGAEvent } from '@next/third-parties/google';

// --- 🕒 Helper: คำนวณเวลาอัปเดต ---
const getRelativeTime = (dateString: string): string => {
  if (!dateString) return "";
  const now = new Date();
  const updated = new Date(dateString);
  const diffInMs = now.getTime() - updated.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "ไม่กี่นาทีที่แล้ว";
  if (diffInHours < 24) return `${diffInHours} ชม. ที่แล้ว`;
  return `${diffInDays} วันที่แล้ว`;
};

// --- 🎨 Brand Icons SVG ---
const FacebookIcon = () => <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const YoutubeIcon = () => <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const TikTokIcon = () => <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-4.17.07-8.33.07-12.5z"/></svg>;

// ✨ ปรับ Query ดึง mangaType มาเพื่อใช้คัดกรองแท็บใหม่ ✨
const getMangaQuery = `*[_type == "manga"] | order(_updatedAt desc) {
  ...,
  "slug": slug.current,
  "coverUrl": cover.asset->url,
  "bannerUrl": bannerImage.asset->url,
  updateDay,
  status,
  mangaType,
  mangaLinks[]{ platform, url, btnColor },
  relatedStories[]->{
    title, "slug": slug.current, "coverUrl": cover.asset->url,
    status, mangaType, latestChapter, genres, chapterUpdatedAt,
    mangaLinks[]{ platform, url, btnColor }
  }
}`;

const days = [
  { label: "MON", value: "monday", thai: "จันทร์" },
  { label: "TUE", value: "tuesday", thai: "อังคาร" },
  { label: "WED", value: "wednesday", thai: "พุธ" },
  { label: "THU", value: "thursday", thai: "พฤหัสบดี" },
  { label: "FRI", value: "friday", thai: "ศุกร์" },
  { label: "SAT", value: "saturday", thai: "เสาร์" },
  { label: "SUN", value: "sunday", thai: "อาทิตย์" },
];

export default function Home() {
  const [allManga, setAllManga] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedManga, setSelectedManga] = useState<any>(null); 
  const [currentBanner, setCurrentBanner] = useState(0);
  const [gridCols, setGridCols] = useState(2); 
  const [displayLimit, setDisplayLimit] = useState(12);
  const [showSchedule, setShowSchedule] = useState(false);

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const [selectedDay, setSelectedDay] = useState(dayNames[new Date().getDay()]);
  
  const catalogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedManga) {
      sendGAEvent('event', 'view_manga', {
        manga_title: selectedManga.title
      });
    }
  }, [selectedManga]);

  useEffect(() => {
    client.fetch(getMangaQuery).then((data) => setAllManga(data || []));
  }, []);

  useEffect(() => {
    const featured = allManga.filter((m: any) => m.isFeatured);
    if (featured.length <= 1) return;
    const timer = setInterval(() => setCurrentBanner((prev) => (prev + 1) % featured.length), 5000);
    return () => clearInterval(timer);
  }, [allManga]);

  const processedManga = useMemo(() => {
    let result = allManga;
    if (activeTab !== "ทั้งหมด") {
      if (activeTab === "✅ จบแล้ว") {
        result = result.filter((m: any) => m.status === "completed" || m.status === "จบแล้ว");
      } else {
        const typeMap: any = { "🌈 BL ปกติ": "bl_normal", "🔞 BL 18+": "bl_18" };
        result = result.filter((m: any) => m.mangaType === typeMap[activeTab]);
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m: any) => 
        m.title.toLowerCase().includes(q) || 
        m.englishTitle?.toLowerCase().includes(q) ||
        m.altTitles?.some((alt: string) => alt.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allManga, activeTab, searchQuery]);

  const latestUpdatedManga = useMemo(() => {
    return [...processedManga].sort((a, b) => {
      const dateA = a.chapterUpdatedAt || a._updatedAt;
      const dateB = b.chapterUpdatedAt || b._updatedAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }).slice(0, 10);
  }, [processedManga]);

  const scheduledManga = useMemo(() => {
    return allManga.filter((m: any) => m.updateDay === selectedDay);
  }, [allManga, selectedDay]);

  const featuredManga = useMemo(() => allManga.filter((m: any) => m.isFeatured), [allManga]);

  const completedManga = useMemo(() => {
    return allManga
      .filter((m: any) => m.status === "completed" || m.status === "จบแล้ว")
      .slice(0, 10);
  }, [allManga]);

  const isSearching = searchQuery.trim().length > 0;

  const getGridClass = () => {
    if (gridCols === 1) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (gridCols === 2) return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white pb-20 overflow-x-hidden font-sans selection:bg-pink-500/30">
      <Toaster position="bottom-right" theme="dark" richColors />

      {/* --- 1. Top Banner --- */}
      {!isSearching && featuredManga.length > 0 && (
        <section className="w-full h-[220px] md:h-[450px] relative overflow-hidden bg-black border-b border-white/5">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentBanner} 
              className="absolute inset-0 w-full h-full cursor-pointer" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.85 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.4 }} 
              onClick={() => setSelectedManga(featuredManga[currentBanner])}
            >
              <img src={featuredManga[currentBanner]?.bannerUrl || featuredManga[currentBanner]?.coverUrl} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {featuredManga.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-10 bg-pink-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* --- 2. Branding Header: สาววายขอแปล --- */}
      <div className="mt-10 mb-8 px-4 md:px-6 flex flex-col items-center">
        {/* ✨ นำ scale-110 md:scale-125 และขนาดรูปกลับมาให้เท่าเว็บเดิมเป๊ะๆ */}
        <div className="flex items-center gap-6 mb-5 scale-110 md:scale-125 transition-transform duration-500">
          <div className="relative">
             <div className="absolute inset-0 bg-pink-500 blur-2xl opacity-20 rounded-full" />
             <img 
               src="/profile.png" 
               className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-pink-500 p-0.5 shadow-2xl bg-[#0D0D0D]" 
               alt="สาววายขอแปล" 
             />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-black italic uppercase leading-none tracking-tighter text-white">
              สาววายขอ<span className="text-pink-500">แปล</span>
            </h1>
            <p className="text-pink-400 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] mt-2 opacity-90">
              แปลแต่วายงับบ
            </p>
          </div>
        </div>

        <div className="flex gap-10 text-gray-400 mb-8 transition-all">
           <a href="https://www.facebook.com/share/1CL7rzs25b/?mibextid=wwXIfr" className="hover:text-blue-500 transition-all hover:-translate-y-1 hover:scale-110 active:scale-95"><FacebookIcon /></a>
           <a href="#" className="hover:text-red-600 transition-all hover:-translate-y-1 hover:scale-110 active:scale-95"><YoutubeIcon /></a>
           <a href="https://www.tiktok.com/@translatelover?_r=1&_t=ZS-95Z1UuW6LG4" className="hover:text-pink-500 transition-all hover:-translate-y-1 hover:scale-110 active:scale-95"><TikTokIcon /></a>
        </div>

        {/* --- 3. Search & Control Center --- */}
        <div className="w-full max-w-4xl space-y-5">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="ค้นหามังฮวา BL ที่คุณรัก..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4.5 px-10 text-base focus:border-pink-500 outline-none transition-all shadow-2xl" 
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-500 transition-colors" size={22} />
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-1.5 bg-[#111] p-1.5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
              {['ทั้งหมด', '🌈 BL ปกติ', '🔞 BL 18+', '✅ จบแล้ว'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === tab ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center flex-wrap sm:flex-nowrap">
              {/* ✨ ปุ่มลิงก์ไปเว็บชายหญิง */}
              <a 
                href="https://translatelover.vercel.app" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-3 md:px-4 md:py-3.5 bg-[#111] hover:bg-indigo-500/10 text-gray-400 hover:text-indigo-400 border border-white/10 hover:border-indigo-500/30 rounded-2xl text-[10px] md:text-[11px] font-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
                title="ไปเว็บแปลรักข้างหมอน"
              >
                <ExternalLink size={14} className="text-indigo-500 flex-shrink-0" />
                <span className="hidden sm:inline">อ่านแนวชายหญิงคลิกเลย</span>
                <span className="sm:hidden">แนวชายหญิง</span>
              </a>

              <button 
                onClick={() => setSelectedManga(allManga[Math.floor(Math.random() * allManga.length)])} 
                className="p-3 md:p-3.5 bg-[#111] border border-white/10 rounded-2xl text-gray-400 hover:text-pink-500 shadow-lg active:scale-90 transition-all flex-shrink-0"
                title="สุ่มเรื่องอ่าน"
              >
                <Shuffle size={18} className="md:w-5 md:h-5" />
              </button>

              <button 
                onClick={() => setShowSchedule(!showSchedule)} 
                className={`p-3 md:p-3.5 border rounded-2xl shadow-lg transition-all active:scale-90 flex-shrink-0 ${showSchedule ? 'bg-pink-600 border-pink-500 text-white shadow-pink-500/20' : 'bg-[#111] border-white/10 text-gray-400 hover:text-pink-500'}`}
                title="ตารางอัปเดต"
              >
                <Calendar size={18} className="md:w-5 md:h-5" />
              </button>
              
              <div className="flex items-center gap-1.5 bg-[#111] p-1.5 rounded-2xl border border-white/10 shadow-lg flex-shrink-0">
                  <button onClick={() => setGridCols(1)} className={`p-2 md:p-2.5 rounded-xl transition-all ${gridCols === 1 ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><Square size={16} className="md:w-[18px] md:h-[18px]" /></button>
                  <button onClick={() => setGridCols(2)} className={`p-2 md:p-2.5 rounded-xl transition-all ${gridCols === 2 ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><Grid2X2 size={16} className="md:w-[18px] md:h-[18px]" /></button>
                  <button onClick={() => setGridCols(3)} className={`p-2 md:p-2.5 rounded-xl transition-all ${gridCols === 3 ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><Grid3X3 size={16} className="md:w-[18px] md:h-[18px]" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 4. Content Area --- */}
      <div className="w-full max-w-7xl mx-auto px-2 md:px-8">
        {!isSearching ? (
          <div className="space-y-12 md:space-y-16">
            
            {/* --- ตารางอัปเดตรายสัปดาห์ --- */}
            <AnimatePresence>
              {showSchedule && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  className="overflow-hidden"
                >
                  <div className="w-full bg-[#0D0D0D] border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-4 md:p-10 shadow-2xl relative mb-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[100px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-pink-500/10 rounded-xl border border-pink-500/20 text-pink-500">
                             <Clock size={20} />
                           </div>
                           <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">ตารางการลงงาน</h2>
                        </div>
                        <button onClick={() => setShowSchedule(false)} className="text-[10px] font-black text-gray-600 hover:text-white uppercase tracking-widest transition-colors">Close</button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-2 mb-10">
                      {days.map((day) => (
                        <button
                          key={day.value}
                          onClick={() => setSelectedDay(day.value)}
                          className={`py-3 md:py-4 rounded-xl text-[9px] md:text-[11px] font-black transition-all ${
                            selectedDay === day.value 
                            ? "bg-pink-600 text-white shadow-[0_10px_20px_-5px_rgba(236,72,153,0.5)] scale-105" 
                            : "bg-white/[0.03] text-gray-500 hover:bg-white/10"
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>

                    <MangaRow 
                       title={`คิวงานวัน${days.find(d => d.value === selectedDay)?.thai}`} 
                       icon={<Zap size={18} />} 
                       items={scheduledManga} 
                       onCardClick={setSelectedManga} 
                       gridCols={gridCols} 
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <MangaRow 
              title="อัปเดตตอนใหม่ล่าสุด" 
              icon={<Zap size={18} className="text-pink-500" fill="currentColor"/>} 
              items={latestUpdatedManga} 
              onCardClick={setSelectedManga} 
              gridCols={gridCols} 
              showTime={true} 
              getRelativeTime={getRelativeTime} 
            />
            
            <MangaRow title="มังฮวา BL เข้าใหม่" icon={<Plus size={18}/>} items={[...processedManga].sort((a,b) => b._createdAt.localeCompare(a._createdAt)).slice(0, 10)} onCardClick={setSelectedManga} gridCols={gridCols} />
            <MangaRow title="เรื่องยอดนิยมประจำสัปดาห์" icon={<Crown size={18} className="text-yellow-500" fill="currentColor"/>} items={[...processedManga].sort((a,b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 10)} onCardClick={setSelectedManga} gridCols={gridCols} />

            <MangaRow 
              title="มังฮวาที่แปลจบสมบูรณ์" 
              icon={<CheckCircle size={18} className="text-emerald-500" />} 
              items={completedManga} 
              onCardClick={setSelectedManga} 
              gridCols={gridCols} 
            />
            
            {/* Catalog Section */}
            <section ref={catalogRef} className="pt-10 border-t border-white/5">
              <div className="flex items-center gap-3 mb-10 px-2">
                <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 shadow-lg">
                  <LayoutGrid className="text-pink-500" size={24} />
                </div>
                <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-white">คลังมังฮวา BL ทั้งหมด</h2>
              </div>
              
              <div className={`grid ${getGridClass()} gap-3 md:gap-5 transition-all duration-500`}>
                <AnimatePresence mode="popLayout">
                  {processedManga.slice(0, displayLimit).map((m: any) => (
                    <MangaCard key={m.slug} manga={m} onClick={() => setSelectedManga(m)} />
                  ))}
                </AnimatePresence>
              </div>

              {displayLimit < processedManga.length && (
                <div className="mt-20 flex justify-center">
                  <button 
                    onClick={() => setDisplayLimit(prev => prev + 12)} 
                    className="px-14 py-4.5 bg-pink-600 hover:bg-pink-500 text-white font-black text-[11px] rounded-2xl uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 border border-white/10"
                  >
                    ดูเพิ่มอีกหน่อยงับ
                  </button>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className={`grid ${getGridClass()} gap-3 md:gap-5`}>
            {processedManga.map((m: any) => <MangaCard key={m.slug} manga={m} onClick={() => setSelectedManga(m)} />)}
          </div>
        )}
      </div>

      <footer className="opacity-20 text-[9px] font-black tracking-[1.5em] uppercase text-center border-t border-white/5 pt-10 mt-10 pb-8 w-full px-6">
        สาววายขอแปล • 2026
      </footer>

      {/* --- 🚨 GLOBAL DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedManga && (
          <MangaCard 
            manga={selectedManga} 
            isGlobalModal={true} 
            onClose={() => setSelectedManga(null)} 
            onMangaSwap={setSelectedManga} 
            allManga={allManga} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

