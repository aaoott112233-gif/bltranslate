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
    "siteTitle": "แปลรักข้างหมอน" 
  }`;
  
  const manga = await client.fetch(query, { slug });

  // กรณีหาเรื่องนั้นไม่เจอ
  if (!manga) return { title: "ไม่พบผลงานที่ค้นหา | แปลรักข้างหมอน" };

  // ✨ จัดการข้อความ Fallback กรณีไม่มีคำอธิบาย
  const siteDescription = manga.description || `อ่านมังฮวาเรื่อง ${manga.title} งานแปลคุณภาพระดับพรีเมียมได้ที่นี่ - แปลรักข้างหมอน`;

  return {
    title: `${manga.title} - แปลรักข้างหมอน`,
    description: siteDescription,
    // ✨ เพิ่ม Canonical URL เพื่อป้องกัน Google สับสนเรื่องหน้าซ้ำ
    alternates: {
      canonical: `/manga/${slug}`,
    },
    openGraph: {
      title: manga.title,
      description: siteDescription,
      siteName: "แปลรักข้างหมอน", // ✨ เพิ่มชื่อเว็บให้ดูเป็นทางการใน Social Share
      images: [
        {
          url: manga.coverUrl,
          width: 800,
          height: 1200,
          alt: manga.title,
        },
      ],
      type: "article", // ✨ ปรับจาก website เป็น article เพื่อให้ Social เข้าใจว่าเป็นเนื้อหา
    },
    twitter: {
      card: "summary_large_image",
      title: manga.title,
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

