import { client } from "@/sanity/lib/client";
import { Metadata } from "next";
import RedirectHandler from "./RedirectHandler";

type Props = {
  params: Promise<{ slug: string }>;
};

// ✨ ฟังก์ชันสำหรับดึงข้อมูลมาทำ SEO/Social Share
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // ✨ ปรับ Query ให้ดึงข้อมูลมาทำ SEO ให้ครบถ้วน
  const query = `*[_type == "manga" && slug.current == $slug][0]{
    title,
    description,
    "coverUrl": cover.asset->url,
    "siteTitle": "สาววายขอแปล"
  }`;
  
  const manga = await client.fetch(query, { slug });

  // กรณีหาเรื่องนั้นไม่เจอ
  if (!manga) return { title: "ไม่พบมังฮวาที่ค้นหา | สาววายขอแปล" };

  // ✨ จัดการข้อความ Fallback กรณีไม่มีคำอธิบาย
  const siteDescription = manga.description || `อ่านมังฮวา BL เรื่อง ${manga.title} สนุกฟินจิกหมอน แปลแต่วายงับบ - สาววายขอแปล`;

  // ✨ โลจิกป้องกัน AI แบนลิงก์! (จุดสำคัญที่สุด)
  const isAdult = manga.mangaType === 'bl_18';
  
  // ถ้าเป็น 18+ ให้ดึงรูปลับมาใช้แทน (เปลี่ยนลิงก์เป็นเว็บจริงของแอดมินด้วยนะครับ)
  // ถ้าไม่ใช่ 18+ ให้ใช้รูปปกเดิม แต่จำกัดขนาดความกว้างเพื่อไม่ให้เฟสบุ๊คขยายเต็มจอ
  const shareImageUrl = isAdult 
    ? "https://bltranslate.vercel.app/profile.png" // 👈 แก้โดเมนตรงนี้ด้วยน้าาา
    : `${manga.coverUrl}?w=600&fit=max`;

  
  return {
    title: `${manga.title} - สาววายขอแปล`,
    description: siteDescription,
    // ✨ เพิ่ม Canonical URL เพื่อป้องกัน Google สับสนเรื่องหน้าซ้ำ
    alternates: {
      canonical: `/manga/${slug}`,
    },
    openGraph: {
      // ✨ ถ้าเป็น 18+ แอบเติมคำเตือนหน้าชื่อเรื่องให้ดึงดูดใจ
      title: `${isAdult ? '🔞 [18+] ' : ''}${manga.title} - สาววายขอแปล`,
      description: siteDescription,
      siteName: "สาววายขอแปล",
      images: [
        {
          url: shareImageUrl, // ✨ ใช้รูปที่ผ่านการกรองแล้ว
          width: 600,
          height: isAdult ? 600 : 850, // ปรับความสูงตามชนิดรูป (โปรไฟล์=จัตุรัส / ปก=แนวตั้ง)
          alt: manga.title,
        },
      ],
      type: "article", 
    },
    twitter: {
      // ✨ เปลี่ยนจาก summary_large_image เป็น summary เฉยๆ เพื่อให้กรอบแชร์ดูเล็กกะทัดรัด
      card: "summary", 
      title: `${isAdult ? '🔞 [18+] ' : ''}${manga.title} - สาววายขอแปล`,
      description: siteDescription,
      images: [shareImageUrl],
    },
  };
}

export default async function MangaPage({ params }: Props) {
  const { slug } = await params;
  
  // ✨ เรียกใช้ Client-side Redirect เพื่อถ่วงเวลาให้บอทอ่านรูปปกก่อน
  return <RedirectHandler slug={slug} />;
}

