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

  return {
    title: `${manga.title} - สาววายขอแปล`,
    description: siteDescription,
    // ✨ เพิ่ม Canonical URL เพื่อป้องกัน Google สับสนเรื่องหน้าซ้ำ
    alternates: {
      canonical: `/manga/${slug}`,
    },
    openGraph: {
      title: `${manga.title} - สาววายขอแปล`,
      description: siteDescription,
      siteName: "สาววายขอแปล",
      images: [
        {
          url: manga.coverUrl,
          width: 800,
          height: 1200,
          alt: manga.title,
        },
      ],
      type: "article", 
    },
    twitter: {
      card: "summary_large_image",
      title: `${manga.title} - สาววายขอแปล`,
      description: siteDescription,
      images: [manga.coverUrl],
    },
  };
}

export default async function MangaPage({ params }: Props) {
  const { slug } = await params;
  
  // ✨ เรียกใช้ Client-side Redirect เพื่อถ่วงเวลาให้บอทอ่านรูปปกก่อน
  return <RedirectHandler slug={slug} />;
}

