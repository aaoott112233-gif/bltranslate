import { client } from "@/sanity/lib/client";
import { Metadata } from "next";
import RedirectHandler from "./RedirectHandler";

type Props = {
  params: Promise<{ slug: string }>;
};

// ✨ ฟังก์ชันสำหรับดึงข้อมูลมาทำ SEO/Social Share
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // ✨ ปรับ Query ดึงข้อมูลมาทำ SEO ให้ครบถ้วน (เอา mangaType มาเผื่อใช้เติมคำว่า 18+ ในชื่อเรื่อง)
  const query = `*[_type == "manga" && slug.current == $slug][0]{
    title,
    description,
    mangaType,
    "siteTitle": "สาววายขอแปล"
  }`;
  
  const manga = await client.fetch(query, { slug });

  // กรณีหาเรื่องนั้นไม่เจอ
  if (!manga) return { title: "ไม่พบมังฮวาที่ค้นหา | สาววายขอแปล" };

  // ✨ จัดการข้อความ Fallback กรณีไม่มีคำอธิบาย
  const siteDescription = manga.description || `อ่านมังฮวา BL เรื่อง ${manga.title} สนุกฟินจิกหมอน แปลแต่วายงับบ - สาววายขอแปล`;

  const isAdult = manga.mangaType === 'bl_18';
  
  // ✨ โลจิกใหม่: บังคับใช้รูปโปรไฟล์เว็บ (โลโก้) เสมอ เพื่อความปลอดภัย 100%
  // ⚠️ สำคัญ: แอดมินต้องเปลี่ยน "https://bltranslate.vercel.app" เป็นโดเมนเว็บจริงของแอดมินด้วยนะครับ
  const shareImageUrl = "https://bltranslate.vercel.app/profile.png"; 

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
          url: shareImageUrl, // ✨ ใช้รูปโลโก้อย่างเดียวเท่านั้น!
          width: 800, // โลโก้เป็นจัตุรัส ใช้ 800x800 เลยครับ
          height: 800, 
          alt: "สาววายขอแปล",
        },
      ],
      type: "article", 
    },
    twitter: {
      // ✨ ใช้ card แบบ summary จะได้รูปจัตุรัสเล็กๆ สวยๆ ไม่ใหญ่เต็มจอ
      card: "summary", 
      title: `${isAdult ? '🔞 [18+] ' : ''}${manga.title} - สาววายขอแปล`,
      description: siteDescription,
      images: [shareImageUrl],
    },
  };
}

export default async function MangaPage({ params }: Props) {
  const { slug } = await params;
  
  // ✨ เรียกใช้ Client-side Redirect เพื่อถ่วงเวลาให้บอทอ่านข้อมูลก่อน
  return <RedirectHandler slug={slug} />;
}

