"use client";

import { motion } from "framer-motion";
import MangaCard from "./MangaCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { sendGAEvent } from '@next/third-parties/google'; 

interface MangaRowProps {
  title: string;
  icon: any;
  items: any[];
  onCardClick: (manga: any) => void;
  viewAllLink?: string; 
  gridCols: number;
  showTime?: boolean;
  getRelativeTime?: (date: string) => string;
}

export default function MangaRow({ 
  title, 
  icon, 
  items, 
  onCardClick, 
  viewAllLink, 
  gridCols,
  showTime,
  getRelativeTime 
}: MangaRowProps) {
  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, 10);

  const getDynamicWidth = () => {
    switch (gridCols) {
      case 1: return "w-[185px] sm:w-[220px] md:w-[245px]"; 
      case 2: return "w-[155px] sm:w-[185px] md:w-[215px]"; 
      case 3: return "w-[135px] sm:w-[155px] md:w-[180px]"; 
      default: return "w-[155px]";
    }
  };

  const handleCardClick = (manga: any) => {
    sendGAEvent('event', 'row_item_click', { 
      row_title: title, 
      manga_title: manga.title 
    });
    onCardClick(manga);
  };

  return (
    <div className="w-full mb-8 md:mb-12 group/row relative px-2">
      <div className="flex items-center justify-between mb-4 px-1 md:px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.1)] transition-all duration-500">
            {icon && <span className="scale-90 inline-block">{icon}</span>}
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-base md:text-xl font-black uppercase tracking-tight italic text-white/90 leading-none">
              {title}
            </h2>
            <div className="h-[1.5px] w-8 bg-pink-500 mt-1.5 rounded-full opacity-40 group-hover/row:w-full transition-all duration-700 ease-in-out" />
          </div>
        </div>
        
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="flex items-center gap-1 pr-1 group/btn"
          >
            <span className="text-[10px] md:text-xs font-bold text-gray-500 group-hover/btn:text-white transition-colors duration-300">
              ดูทั้งหมด
            </span>
            <ChevronRight size={16} className="text-gray-500 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all duration-300" />
          </Link>
        )}
      </div>

      <div className="relative overflow-visible group/scroll">
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] via-[#050505]/20 to-transparent z-10 pointer-events-none hidden md:block opacity-0 group-hover/scroll:opacity-100 transition-opacity duration-500" />
        
        <div 
          className="flex gap-3 md:gap-4 overflow-x-auto pb-5 premium-scrollbar snap-x scroll-px-2 scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {displayItems.map((manga, index) => (
            <motion.div 
              key={manga.slug}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.4,
                delay: index * 0.03,
                ease: [0.22, 1, 0.36, 1]
              }}
              className={`${getDynamicWidth()} flex-shrink-0 snap-start transition-all duration-500`}
            >
              <MangaCard 
                manga={manga} 
                onClick={() => handleCardClick(manga)} 
                relativeTime={showTime && getRelativeTime ? getRelativeTime(manga.chapterUpdatedAt || manga._updatedAt) : null}
                gridMode={gridCols} /* ✨ 2. ส่งค่าปุ่มที่กด (1,2,3) ทะลุเข้าไปให้การ์ด */
              />
            </motion.div>
          ))}
          
          {viewAllLink && items.length > 10 && (
             <div className={`${getDynamicWidth()} flex-shrink-0 snap-start`}>
               <Link href={viewAllLink} className="block w-full h-full min-h-[200px] md:min-h-[260px] group/more">
                 <div className="w-full h-full rounded-2xl bg-transparent hover:bg-[#111] flex flex-col items-center justify-center gap-3 transition-colors duration-300 border border-transparent hover:border-white/5">
                    
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover/more:bg-white/5 transition-all duration-300">
                       <ChevronRight size={20} className="text-gray-600 group-hover/more:text-white group-hover/more:translate-x-0.5 transition-transform duration-300" />
                    </div>
                    
                    <div className="flex flex-col items-center gap-0.5">
                       <span className="text-xs md:text-sm font-medium text-gray-500 group-hover/more:text-white transition-colors duration-300">ดูทั้งหมด</span>
                       <span className="text-[10px] text-gray-600">({items.length})</span>
                    </div>

                 </div>
               </Link>
             </div>
          )}

          <div className="w-10 flex-shrink-0" />
        </div>
      </div>

      <style jsx global>{`
        .premium-scrollbar::-webkit-scrollbar { height: 5px; transition: all 0.3s ease; }
        .premium-scrollbar::-webkit-scrollbar-track { background: transparent; margin-inline: 10px; }
        .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 100px; }
        .group\/row:hover .premium-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(236, 72, 153, 0.6) !important; }
        .premium-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(236, 72, 153, 0.1) transparent; }
      `}</style>
    </div>
  );
}


