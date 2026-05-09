import { client } from "@/sanity/lib/client";
import { Metadata } from "next";
import { redirect } from "next/navigation";

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
    "siteTitle": "สาววายขอแปล" // ✨ 1. แก้ไขเป็นชื่อเพจใหม่
  }`;
  
  const manga = await client.fetch(query, { slug });

  // กรณีหาเรื่องนั้นไม่เจอ
  if (!manga) return { title: "ไม่พบมังฮวาที่ค้นหา | สาววายขอแปล" }; // ✨ 2. แก้ไขเป็นชื่อเพจใหม่

  // ✨ จัดการข้อความ Fallback กรณีไม่มีคำอธิบาย
  const siteDescription = manga.description || `อ่านมังฮวา BL เรื่อง ${manga.title} สนุกฟินจิกหมอน แปลแต่วายงับบ - สาววายขอแปล`; // ✨ 3. ปรับสโลแกนให้เข้ากับสายวาย

  return {
    title: `${manga.title} - สาววายขอแปล`, // ✨ 4. แก้ไขเป็นชื่อเพจใหม่
    description: siteDescription,
    // ✨ เพิ่ม Canonical URL เพื่อป้องกัน Google สับสนเรื่องหน้าซ้ำ
    alternates: {
      canonical: `/manga/${slug}`,
    },
    openGraph: {
      title: `${manga.title} - สาววายขอแปล`, // ✨ 5. ทำให้การแชร์เห็นชื่อเพจชัดเจนขึ้น
      description: siteDescription,
      siteName: "สาววายขอแปล", // ✨ 6. แก้ไขเป็นชื่อเพจใหม่
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
  
  // ✨ ส่งกลับหน้าหลักพร้อมพารามิเตอร์เพื่อให้เปิด Modal อัตโนมัติ
  redirect(`/?open=${slug}`);
}

