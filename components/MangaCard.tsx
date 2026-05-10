"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  BookOpen, 
  Share2, 
  Info, 
  Flame,
  Tag as TagIcon,
  ChevronDown,
  ChevronUp,
  Heart
} from "lucide-react";
import { toast } from 'sonner';
import { sendGAEvent } from '@next/third-parties/google'; 
import Image from "next/image";

interface MangaLink {
  platform: string;
  url: string;
  btnColor?: string;
}

interface RelatedStory {
  title: string;
  englishTitle?: string;
  slug: string;
  coverUrl: string;
  status: string;
  latestChapter?: string;
  mangaType?: string;
  mangaLinks?: MangaLink[];
  genres?: string[];
}

interface MangaProps {
  manga: {
    title: string;
    englishTitle?: string;
    originalTitle?: string;
    slug: string;
    coverUrl: string;
    mangaType?: string;
    status: string;
    latestChapter?: string;
    mangaLinks?: MangaLink[];
    novelUrl?: string;
    description?: string;
    tags?: string[];
    genres?: string[];
    relatedStories?: RelatedStory[];
    _updatedAt: string;
    chapterUpdatedAt?: string;
  };
  onClick?: () => void;
  isGlobalModal?: boolean;
  onClose?: () => void;
  onMangaSwap?: (item: any) => void;
  allManga?: any[]; 
  relativeTime?: string | null;
  isCompact?: boolean;
  gridMode?: number;
}

const isCompleted = (status: string) => 
  status === 'completed' || 
  status === '✅ แปลจบแล้ว (Completed)' || 
  status === 'จบแล้ว';

const DetailedSuggestion = ({ item, onMangaSwap }: any) => {
  const getStatusStyle = (status: string) => {
    if (isCompleted(status)) return 'bg-pink-600 text-white';
    if (status === 'ongoing' || status === '✍️ อัปเดตตอนใหม่ (Ongoing)') return 'bg-emerald-600 text-white';
    if (status === 'hot' || status === '🔥 HOT (กำลังฮิต)') return 'bg-orange-600 text-white';
    if (status === 'hiatus' || status === '⏳ พักซีซั่น (Hiatus)') return 'bg-amber-600 text-white';
    return 'bg-white/10 text-gray-400';
  };

  return (
    <div 
      onClick={() => onMangaSwap?.(item)} 
      className="cursor-pointer flex flex-col gap-3 p-3 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-pink-500/10 transition-all group/item shadow-lg"
    >
      <div className="flex gap-4 items-start">
        <div className="relative w-20 h-28 sm:w-24 sm:h-34 flex-shrink-0 rounded-xl overflow-hidden shadow-xl border border-white/5">
          <Image src={item.coverUrl} alt={item.title} fill sizes="100px" className="object-cover group-hover/item:scale-110 transition-transform duration-500" />
        </div>
        
        <div className="flex flex-col flex-1 min-w-0 pt-0">
          <h5 className="text-[11px] sm:text-[14px] font-bold text-gray-100 line-clamp-2 uppercase italic mb-1 leading-tight transition-colors group-hover/item:text-pink-400">
            {item.title}
          </h5>
          <p className="text-[9px] text-gray-500 uppercase truncate mb-2.5 opacity-60 font-medium">{item.englishTitle}</p>
          
          <div className="flex flex-wrap gap-1.5 mb-2.5 items-center">
              <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black uppercase shadow-sm border border-white/10">
                EP.{item.latestChapter || '??'}
              </span>
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm ${getStatusStyle(item.status)}`}>
                {isCompleted(item.status) ? 'จบแล้ว' : 'ปั่นอยู่'}
              </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
             {item.genres?.slice(0, 3).map((g: string) => (
               <span key={g} className="text-[8px] text-gray-500 font-medium border border-white/5 px-1.5 rounded">#{g}</span>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MangaCard({ manga, onClick, isGlobalModal, onClose, onMangaSwap, allManga, relativeTime, isCompact, gridMode }: MangaProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [isSaved, setIsSaved] = useState(false);

  // เช็กว่าเรื่องนี้เคยถูกบันทึกไว้ในเบราว์เซอร์ไหมตอนเปิด Modal
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('manga_bookmarks') || '[]');
    setIsSaved(savedBookmarks.includes(manga.slug));
  }, [manga.slug]);

  // ฟังก์ชันสลับสถานะ เก็บเข้า / เอาออก จากชั้นหนังสือ
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    let savedBookmarks = JSON.parse(localStorage.getItem('manga_bookmarks') || '[]');
    
    if (isSaved) {
      savedBookmarks = savedBookmarks.filter((slug: string) => slug !== manga.slug);
      localStorage.setItem('manga_bookmarks', JSON.stringify(savedBookmarks));
      setIsSaved(false);
      toast.error("เอาออกจากชั้นหนังสือแล้ว", { icon: "💔" });
    } else {
      savedBookmarks.push(manga.slug);
      localStorage.setItem('manga_bookmarks', JSON.stringify(savedBookmarks));
      setIsSaved(true);
      toast.success("เก็บเข้าชั้นหนังสือแล้ว!", { icon: "❤️" });
    }
  };
  
  const getStatusColor = (status: string) => {
    if (isCompleted(status)) return 'bg-pink-500';
    if (status === 'ongoing' || status === '✍️ อัปเดตตอนใหม่ (Ongoing)') return 'bg-emerald-500';
    if (status === 'hot' || status === '🔥 HOT (กำลังฮิต)') return 'bg-orange-500';
    if (status === 'hiatus' || status === '⏳ พักซีซั่น (Hiatus)') return 'bg-amber-500';
    return 'bg-gray-500';
  };

  const getRedirectUrl = (targetUrl: string) => `/redirect?url=${encodeURIComponent(targetUrl)}`;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/manga/${manga.slug}`;
    navigator.clipboard.writeText(shareUrl);
    sendGAEvent('event', 'share_manga', { manga_title: manga.title });
    toast.success("คัดลอกลิงก์ไปส่งต่อให้เพื่อนสาวแล้วนะ!", { position: "bottom-center" });
  };

  const handleLinkClick = (platform: string) => {
    sendGAEvent('event', 'click_reading_link', { 
      manga_title: manga.title, 
      platform: platform 
    });
  };

  const similarStories = useMemo(() => {
    if (!allManga) return [];
    return allManga.filter((item: any) => 
      item.slug !== manga.slug && 
      item.genres?.some((g: string) => manga.genres?.includes(g))
    ).slice(0, 4);
  }, [allManga, manga.slug, manga.genres]);

  const activeGridMode = gridMode || (isCompact ? 3 : 2);
  
  // ✨ อัปเดตขนาดตัวอักษรและ padding ให้ป้ายเวลาด้วย!
  let bs = {
    ep: 'top-2.5 right-2.5 text-[10px] md:text-[12px] px-2.5 py-1 rounded-lg',
    status: 'top-2.5 left-2.5 px-3 py-1 rounded-full text-[10px] md:text-[12px]',
    title: 'text-[12px] md:text-[14px] p-4',
    adult: 'bottom-2.5 right-2.5 text-[10px] md:text-[12px] px-2 py-0.5 rounded',
    time: 'bottom-2 left-2 px-2 py-1 rounded text-[9px] md:text-[10px]' // ⌚ Default
  };

  if (activeGridMode === 1) { 
    bs = {
      ep: 'top-3 right-3 text-[12px] sm:text-[14px] px-3.5 py-1.5 rounded-xl',
      status: 'top-3 left-3 px-3.5 py-1.5 rounded-full text-[12px] sm:text-[14px]',
      title: 'text-[14px] sm:text-[16px] p-5 sm:p-6',
      adult: 'bottom-3 right-3 text-[12px] sm:text-[14px] px-2.5 py-1 rounded-lg',
      time: 'bottom-3 left-3 px-2.5 py-1.5 rounded-md text-[11px] sm:text-[12px]' // ⌚ ขนาดใหญ่
    };
  } else if (activeGridMode === 3) { 
    bs = {
      ep: 'top-1.5 right-1.5 text-[8.5px] md:text-[10px] px-1.5 py-0.5 rounded-md',
      status: 'top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[8.5px] md:text-[10px]',
      title: 'text-[10px] md:text-[12px] p-2.5 md:p-3',
      adult: 'bottom-1.5 right-1.5 text-[8px] md:text-[10px] px-1.5 py-[2px] rounded-sm',
      time: 'bottom-1.5 left-1.5 px-1.5 py-[2px] rounded-sm text-[8px]' // ⌚ ขนาดจิ๋ว
    };
  }

  if (!isGlobalModal) {
    return (
      <motion.div layout whileHover={{ y: -6 }} onClick={onClick} className="relative group cursor-pointer bg-[#0D0D0D] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 aspect-[3/4.2] shadow-2xl mx-0.5">
        
        <div className={`absolute z-10 bg-pink-600 font-black shadow-xl border border-white/10 uppercase transition-all duration-300 ${bs.ep}`}>
          EP.{manga.latestChapter}
        </div>
        
        <div className={`absolute z-10 font-black text-white ${getStatusColor(manga.status)} shadow-xl uppercase transition-all duration-300 ${bs.status}`}>
          {isCompleted(manga.status) ? 'จบแล้ว' : 'ปั่นอยู่'}
        </div>
        
        <Image src={manga.coverUrl} alt={manga.title} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
        
        {/* ✨ ป้ายเวลาอัปเดต จะดึงค่าขนาดจาก bs.time และมี animation เปลี่ยนขนาดลื่นไหล ✨ */}
        {relativeTime && <div className={`absolute bg-black/60 backdrop-blur-md font-bold text-gray-300 border border-white/5 z-10 transition-all duration-300 ${bs.time}`}>
          {relativeTime}
        </div>}
        
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end ${bs.title}`}>
          <span className="font-bold leading-tight line-clamp-2 text-white italic uppercase tracking-tighter">
            {manga.title}
          </span>
        </div>
        
        {manga.mangaType === 'bl_18' && <div className={`absolute z-10 bg-red-600/90 backdrop-blur-md font-black shadow-xl text-white border border-white/20 transition-all duration-300 ${bs.adult}`}>
           18+
        </div>}

      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2 sm:p-4 pt-12 sm:pt-4 overflow-hidden bg-black/80 backdrop-blur-md">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-transparent" />
      
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 800 }}
        dragElastic={0.6}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 450) {
            onClose?.();
          }
        }}
        initial={{ opacity: 0, scale: 0.95, y: 50 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, y: 800, transition: { duration: 0.3 } }} 
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        className="relative w-full max-w-4xl bg-[#0D0D0D] border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] z-[110] flex flex-col max-h-[88vh] sm:max-h-[94vh] touch-none"
        style={{ overscrollBehavior: 'contain' }}
      >
        
        <div onClick={onClose} className="w-full pt-4 pb-5 cursor-grab active:cursor-grabbing flex flex-col items-center sticky top-0 bg-[#0D0D0D] z-[140] border-b border-white/[0.02]">
           <div className="w-16 h-1.5 bg-white/10 group-hover:bg-white/20 rounded-full transition-colors mb-1.5" />
           <span className="text-[7px] font-black text-white/5 uppercase tracking-[0.4em]">Slide to close Story</span>
        </div>

        <div className="overflow-y-auto custom-vertical-scrollbar p-5 md:p-10 pt-2 space-y-4 md:space-y-6 touch-pan-y">
          
          <div className="flex flex-row gap-4 md:gap-8 items-start relative">
            <div className="w-32 sm:w-48 md:w-60 flex-shrink-0 relative group/cover aspect-[3/4.2] rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
              <Image src={manga.coverUrl} alt={manga.title} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col items-start text-left pt-0 min-w-0 pr-2">
               <div className="mb-2 w-full">
                  <h2 className="text-base sm:text-2xl md:text-3xl font-black italic uppercase leading-[1.1] text-white tracking-tighter break-words line-clamp-2">
                    {manga.title}
                  </h2>
                  <p className="text-gray-500 text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.1em] opacity-60 italic mt-1 break-words line-clamp-2 leading-snug">
                    {manga.englishTitle}
                  </p>
               </div>
               
               <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="px-2.5 py-1 sm:px-4 sm:py-1.5 bg-red-600 text-[8px] sm:text-[10px] font-black rounded-lg uppercase shadow-lg">EP.{manga.latestChapter || '??'}</span>
                  <span className={`px-2.5 py-1 sm:px-4 sm:py-1.5 ${getStatusColor(manga.status)} text-[8px] sm:text-[10px] font-black rounded-lg uppercase shadow-lg`}>
                    {isCompleted(manga.status) ? 'จบแล้ว' : 'ปั่นอยู่'}
                  </span>
                  <span className="px-2.5 py-1 sm:px-4 sm:py-1.5 bg-white/5 border border-white/10 text-[8px] sm:text-[10px] font-black rounded-lg uppercase">
                    {manga.mangaType === 'bl_18' ? '🔞 ADULT 18+' : '🌈 MANHWA BL'}
                  </span>
               </div>
               
               <div className="flex flex-wrap gap-1.5 mb-4">
                  {manga.genres?.slice(0, 4).map((g) => (
                    <span key={g} className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase border border-white/5 px-2.5 py-1 rounded-lg hover:text-pink-400 transition-all cursor-default"># {g}</span>
                  ))}
               </div>

               <div className="flex flex-wrap gap-2">
                 <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white text-[9px] sm:text-[10px] font-black border border-white/5 shadow-md">
                   <Share2 size={12} /> แชร์ให้เพื่อนสาว
                 </button>
                 
                 {/* ✨ ปุ่มเก็บเข้าชั้นหนังสือ (มาแล้วของจริง!) */}
                 <button 
                   onClick={handleBookmark} 
                   className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl transition-all text-[9px] sm:text-[10px] font-black border shadow-md ${isSaved ? 'bg-pink-600 text-white border-pink-500 shadow-pink-500/20' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/5'}`}
                 >
                   <Heart size={12} className={isSaved ? 'fill-white' : ''} /> 
                   <span className="hidden sm:inline">{isSaved ? 'ลบออกจากชั้นหนังสือ' : 'เก็บเข้าชั้นหนังสือ'}</span>
                   <span className="sm:hidden">{isSaved ? 'ลบออก' : 'บันทึก'}</span>
                 </button>
               </div>
            </div>
          </div>

          <div className="bg-white/[0.02] p-5 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-pink-600 opacity-40 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Synopsis / เรื่องย่อ</h4>
            
            <div className="relative">
              <p className={`text-gray-400 text-[12px] md:text-[14px] leading-relaxed italic font-medium opacity-90 transition-all duration-500 ${!isExpanded ? 'line-clamp-4' : ''}`}>
                "{manga.description || "แอดมินกำลังเดินทางข้ามมิติไปเขียนเรื่องย่อให้ครับ..."}"
              </p>
              
              {manga.description && manga.description.length > 150 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-pink-500 uppercase tracking-widest hover:text-pink-400 transition-colors group/btn"
                >
                  {isExpanded ? (
                    <><ChevronUp size={14} className="group-hover/btn:-translate-y-0.5 transition-transform" /> Show Less</>
                  ) : (
                    <><ChevronDown size={14} className="group-hover/btn:translate-y-0.5 transition-transform" /> Read Full Story</>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-[10px] sm:text-[11px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                <ExternalLink size={14} className="text-pink-500" /> เลือกช่องทางการอ่าน
             </h4>
             <div className="grid grid-cols-2 gap-2">
                {manga.mangaLinks?.map((link, i) => (
                  <a 
                    key={i} 
                    href={getRedirectUrl(link.url)} 
                    target="_blank" 
                    onClick={() => handleLinkClick(link.platform)} 
                    style={{ backgroundColor: link.btnColor || '#ec4899' }} 
                    className="flex items-center justify-between px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase shadow-lg hover:brightness-110 active:scale-95 text-white transition-all"
                  >
                    {link.platform} <ExternalLink size={14} />
                  </a>
                ))}
                {manga.novelUrl && (
                  <a 
                    href={getRedirectUrl(manga.novelUrl)} 
                    target="_blank" 
                    onClick={() => handleLinkClick('Thai Novel')}
                    className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-violet-600 rounded-xl font-black text-[10px] sm:text-[11px] uppercase shadow-xl hover:bg-violet-500 text-white transition-all"
                  >
                     <BookOpen size={16} /> READ THAI NOVEL <ExternalLink size={14} />
                  </a>
                )}
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
            <div className="space-y-4">
              <h4 className="text-[10px] sm:text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-3 ml-2"><Info size={16} /> รูปแบบอื่น (จักรวาลเดียวกัน)</h4>
              <div className="grid grid-cols-1 gap-3">
                {manga.relatedStories?.length ? manga.relatedStories.map((rel: any) => (
                  <DetailedSuggestion key={rel.slug} item={rel} onMangaSwap={onMangaSwap} />
                )) : <div className="py-6 text-center border border-dashed border-white/5 rounded-2xl text-gray-700 text-[10px] font-bold uppercase tracking-widest">No Related Data</div>}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] sm:text-[11px] font-black text-pink-500 uppercase tracking-[0.4em] flex items-center gap-3 ml-2"><Flame size={16} /> เรื่องที่คุณอาจจะชอบ</h4>
              <div className="grid grid-cols-1 gap-3">
                {similarStories.length ? similarStories.map((sim: any) => (
                  <DetailedSuggestion key={sim.slug} item={sim} onMangaSwap={onMangaSwap} />
                )) : <div className="py-6 text-center border border-dashed border-white/5 rounded-2xl text-gray-700 text-[10px] font-bold uppercase tracking-widest">No Recommendations</div>}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 mt-4 text-center pb-8">
             <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] mb-4 flex items-center justify-center gap-3"><TagIcon size={12} /> Keywords</h4>
             <div className="flex flex-wrap justify-center gap-2">
                {[manga.originalTitle, ...(manga.tags || [])].filter(Boolean).map((name) => (
                  <span key={name as string} className="px-3 py-1.5 bg-white/[0.02] text-[9px] font-bold text-gray-600 rounded-lg border border-white/5 hover:border-pink-500/40 hover:text-pink-400 transition-all cursor-default">#{name as string}</span>
                ))}
             </div>
          </div>
        </div>

        <style jsx global>{`
          .custom-vertical-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-vertical-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-vertical-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 20px; }
          .custom-vertical-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(236, 72, 153, 0.4); }
        `}</style>
      </motion.div>
    </div>
  );
}

