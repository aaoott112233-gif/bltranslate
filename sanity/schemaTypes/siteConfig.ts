import {defineField, defineType} from 'sanity'

export const siteConfig = defineType({
  name: 'siteConfig',
  title: '⚙️ ตั้งค่าเว็บไซต์ (Site Config)',
  type: 'document',
  fields: [
    defineField({
      name: 'announcementText',
      title: '📢 ข้อความประกาศ (Announcement Bar)',
      type: 'string',
    }),
    defineField({
      name: 'isAnnouncementActive',
      title: 'เปิดใช้งานแถบประกาศ',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})

