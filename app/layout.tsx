import type { Metadata } from "next";
import { Kanit } from "next/font/google"; // ✨ เปลี่ยนมาใช้ฟอนต์ Kanit เพื่อความสวยงามพรีเมียม
import "./globals.css";
// import { Analytics } from "@vercel/analytics/react"; // ✨ 1. เรียกใช้งาน Analytics
import { GoogleAnalytics } from '@next/third-parties/google'; // ✨ 2. <--- แอดมินขาดบรรทัดนี้ไปครับ! 

import AnnouncementBar from "@/components/AnnouncementBar"; // ✨ 3. นำเข้าแถบประกาศ
import { client } from "@/sanity/lib/client"; // ✨ 4. นำเข้า Sanity Client

export const dynamic = "force-dynamic"; // ✨ 5. บังคับห้ามจำแคช เพื่อให้เปิด-ปิดประกาศได้แบบ Real-time

// ✨ ตั้งค่าฟอนต์ Kanit ให้รองรับภาษาไทย
const kanit = Kanit({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
});

// ✨ แก้ Metadata: จุดนี้สำคัญมาก! เปลี่ยนเป็น "สาววายขอแปล"
export const metadata: Metadata = {
  title: "สาววายขอแปล - คลังมังฮวา BL พรีเมียม",
  description: "แปลแต่วายงับบ แหล่งรวมมังฮวา BL สุดฟิน สายวายต้องไม่พลาด ค้นหาง่าย เช็กคิวอัปเดตและวาร์ปอ่านได้ที่นี่",
  openGraph: {
    title: "สาววายขอแปล - คลังมังฮวา BL พรีเมียม",
    description: "แปลแต่วายงับบ แหล่งรวมมังฮวา BL สุดฟิน สายวายต้องไม่พลาด!",
    url: "https://bltranslate.vercel.app", // 👈 (ถ้ามีลิงก์เว็บตอนรันจริง เอามาใส่ตรงนี้ได้เลย)
    siteName: "สาววายขอแปล",
    images: [
      {
        url: "/profile.png", // 👈 ดึงรูปโปรไฟล์มาทำเป็นรูปแชร์
        width: 800,
        height: 800,
        alt: "โลโก้ สาววายขอแปล",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
};

// ✨ 6. เปลี่ยนเป็น async function เพื่อให้ดึงข้อมูลจากหลังบ้านได้
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // ✨ 7. ดึงข้อมูลประกาศจาก Sanity (สั่งปิด CDN เพื่อให้ข้อมูลอัปเดตทันทีที่แก้ในหลังบ้าน)
  const siteConfig = await client.withConfig({ useCdn: false }).fetch(
    `*[_type == "siteConfig"][0]{
      announcementText,
      isAnnouncementActive
    }`,
    {},
    { cache: 'no-store' } 
  );

  return (
    // เปลี่ยน lang="en" เป็น "th" เพื่อให้ถูกหลัก SEO ของเว็บไทย
    <html lang="th" suppressHydrationWarning> 
      <body className={`${kanit.variable} font-sans antialiased`} suppressHydrationWarning>
        
        {/* ✨ 8. ถ้าหลังบ้านกดเปิดใช้งานอยู่ ให้โชว์แถบประกาศสีชมพู */}
        {siteConfig?.isAnnouncementActive && siteConfig?.announcementText && (
           <AnnouncementBar text={siteConfig.announcementText} />
        )}
        
        {children}
        
        {/* ✨ วาง Analytics ไว้ล่างสุดก่อนปิด body เพื่อเริ่มเก็บสถิติ */}
        {/* <Analytics />  */}
        <GoogleAnalytics gaId="G-1BTSRJSPK0" />
      </body>
    </html>
  );
}

