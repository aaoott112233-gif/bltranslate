"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectHandler({ slug }: { slug: string }) {
  const router = useRouter();
  
  useEffect(() => {
    // ใช้ Client-side redirect แทน เพื่อให้ Bot ของเฟส/ไลน์ ทันได้อ่านข้อมูลปกก่อน
    router.replace(`/?open=${slug}`);
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-sans">
      <p className="text-xs text-gray-500 animate-pulse tracking-widest uppercase">
        กำลังพาไปหน้าอ่าน...
      </p>
    </div>
  );
}

