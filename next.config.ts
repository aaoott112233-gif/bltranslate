import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. อนุญาตให้โหลดรูปจาก Sanity (ห้ามลบเด็ดขาด)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // ลบส่วน eslint และ typescript ออกไปเลยครับ เพราะเราไปสั่งปิดที่ package.json แล้ว
};

export default nextConfig;

