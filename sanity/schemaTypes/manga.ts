import {defineField, defineType} from 'sanity'

export const mangaType = defineType({
  name: 'manga',
  title: 'รายชื่อมังฮวา BL',
  type: 'document',
  fields: [
    // --- 🆔 ส่วนที่ 1: ข้อมูลระบุตัวตน (Identity) ---
    defineField({
      name: 'title',
      title: 'ชื่อเรื่อง (ภาษาไทย)',
      type: 'string',
      validation: (Rule) => Rule.required().error('ต้องใส่ชื่อเรื่องภาษาไทยด้วยนะแอด'),
    }),
    defineField({
      name: 'englishTitle',
      title: 'ชื่อภาษาอังกฤษ (English Title)',
      type: 'string',
      description: 'สำคัญ: ใช้สำหรับค้นหาและสร้าง URL',
    }),
    defineField({
      name: 'originalTitle',
      title: 'ชื่อต้นฉบับ (เกาหลี/ญี่ปุ่น)',
      type: 'string',
      description: 'ช่วยให้คนค้นเจอแม้ใช้ชื่อจากต้นทาง',
    }),
    defineField({
      name: 'altTitles',
      title: '🔍 ชื่อเรียกอื่นๆ (Alternative Titles)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'ใส่ชื่ออื่นๆ หรือชื่อเล่นที่คนมักจะใช้ค้นหา (กด Enter เพื่อเพิ่มหลายชื่อได้)',
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'englishTitle',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('อย่าลืมกด Generate ลิงก์นะครับ'),
    }),

    // --- 🏷️ ส่วนที่ 2: การคัดกรองสำหรับเพจสาววาย (BL Filtering) ---
    defineField({
      name: 'mangaType',
      title: '🌈 ประเภทเนื้อหา BL',
      type: 'string',
      options: {
        list: [
          {title: '🌈 BL ปกติ (General / Soft)', value: 'bl_normal'},
          {title: '🔞 BL 18+ (Adult Content)', value: 'bl_18'},
        ],
      },
      initialValue: 'bl_normal',
    }),
    defineField({
      name: 'genres',
      title: '🎭 แนวเรื่องยอดนิยม (BL Tropes)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'เลือกแนวเรื่องเพื่อช่วยในการค้นหาและแนะนำเรื่องที่คล้ายกัน',
      options: {
        list: [
          {title: 'Omegaverse (โอเมก้าเวิร์ส)', value: 'omegaverse'},
          {title: 'Guideverse (ไกด์เวิร์ส)', value: 'guideverse'},
          {title: 'Dom/Sub Universe', value: 'dom-sub'},
          {title: 'Romance (โรแมนติก)', value: 'romance'},
          {title: 'Drama (ดราม่า)', value: 'drama'},
          {title: 'Comedy (ตลก/โบ๊ะบ๊ะ)', value: 'comedy'},
          {title: 'Fantasy (แฟนตาซี)', value: 'fantasy'},
          {title: 'Historical (ย้อนยุค/พีเรียด)', value: 'historical'},
          {title: 'School Life (วัยเรียน)', value: 'school-life'},
          {title: 'Office Worker (วัยทำงาน)', value: 'office'},
          {title: 'Reincarnation (เกิดใหม่/เข้าร่าง)', value: 'reincarnation'},
          {title: 'Action (แอคชั่น)', value: 'action'},
        ]
      }
    }),
    defineField({
      name: 'tags',
      title: '📌 แท็กพิเศษ (เช่น #คลั่งรัก #ตับพัง)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'ใส่คีย์เวิร์ดที่ช่วยดึงดูดนักอ่าน เช่น #พระเอกโบ้ #นายเอกเก่ง',
      options: { layout: 'tags' }
    }),

    // --- 👤 ส่วนที่ 3: ผู้สร้าง (Creators) ---
    defineField({
      name: 'author',
      title: '✍️ ผู้แต่ง (Author)',
      type: 'string',
    }),
    defineField({
      name: 'artist',
      title: '🎨 นักวาด (Artist)',
      type: 'string',
    }),

    // --- 🖼️ ส่วนที่ 4: สื่อหลัก (Media) ---
    defineField({
      name: 'cover',
      title: 'รูปหน้าปก',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bannerImage',
      title: '🖼️ ภาพ Banner (สไลด์หน้าแรก)',
      type: 'image',
      options: {hotspot: true},
      description: 'ภาพที่จะโชว์บนสไลเดอร์หน้าเว็บ แนะนำขนาด 1200x400',
    }),
    defineField({
      name: 'description',
      title: 'เรื่องย่อ / บันทึกจากสาววายขอแปล',
      type: 'text',
      rows: 5,
    }),

    // --- 📊 ส่วนที่ 5: สถานะและตารางอัปเดต ---
    defineField({
      name: 'status',
      title: 'สถานะการแปล',
      type: 'string',
      options: {
        list: [
          {title: '🔥 HOT (กำลังฮิต)', value: 'hot'},
          {title: '✍️ อัปเดตตอนใหม่ (Ongoing)', value: 'ongoing'},
          {title: '⏳ พักซีซั่น (Hiatus)', value: 'hiatus'},
          {title: '✅ แปลจบแล้ว (Completed)', value: 'completed'},
        ],
      },
      initialValue: 'ongoing',
    }),
    defineField({
      name: 'updateDay',
      title: '📅 วันที่ลงตอนใหม่ (Schedule)',
      type: 'string',
      options: {
        list: [
          {title: 'วันจันทร์', value: 'monday'},
          {title: 'วันอังคาร', value: 'tuesday'},
          {title: 'วันพุธ', value: 'wednesday'},
          {title: 'วันพฤหัสบดี', value: 'thursday'},
          {title: 'วันศุกร์', value: 'friday'},
          {title: 'วันเสาร์', value: 'saturday'},
          {title: 'วันอาทิตย์', value: 'sunday'},
          {title: 'ตามอารมณ์แอดมิน (TBA)', value: 'tba'},
        ]
      },
      initialValue: 'tba',
    }),
    defineField({
      name: 'releaseYear',
      title: '📅 ปีที่เริ่มเผยแพร่',
      type: 'string',
      description: 'เช่น 2024, 2025',
    }),
    defineField({
      name: 'latestChapter',
      title: 'ตอนล่าสุด (เช่น ตอนที่ 45)',
      type: 'string',
    }),
    defineField({
      name: 'chapterUpdatedAt',
      title: '📅 วันที่อัปเดตตอนล่าสุด',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'ระบบจะใช้ค่านี้ในการเรียงลำดับ "เรื่องที่อัปเดตล่าสุด" บนหน้าเว็บ',
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
      }
    }),
    defineField({
      name: 'viewCount',
      title: 'ยอดเข้าชม',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'isFeatured',
      title: '⭐ แนะนำเรื่องนี้ (โชว์บนสไลเดอร์)',
      type: 'boolean',
      initialValue: false,
    }),

    // --- 🔗 ส่วนที่ 6: ช่องทางการติดตาม (Links) ---
    defineField({
      name: 'mangaLinks',
      title: 'ช่องทางการอ่าน',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'linkItem',
          fields: [
            {name: 'platform', title: 'ชื่อแพลตฟอร์ม (เช่น Facebook, Webtoon)', type: 'string'},
            {name: 'url', title: 'URL ลิงก์ตรง', type: 'url'},
            {
              name: 'btnColor',
              title: 'สีปุ่ม (Hex Code)',
              type: 'string',
              options: {
                list: [
                  {title: 'ชมพูสาววาย (Love Pink)', value: '#f472b6'},
                  {title: 'ม่วงเข้ม (Adult/Premium)', value: '#8b5cf6'},
                  {title: 'ฟ้า (Facebook)', value: '#3b82f6'},
                  {title: 'เขียว (Line Webtoon)', value: '#22c55e'},
                  {title: 'ดำ (Classic)', value: '#111111'},
                ]
              },
              initialValue: '#f472b6'
            }
          ]
        },
      ],
    }),
    defineField({
      name: 'novelUrl',
      title: 'ลิงก์อ่านนิยาย (ต้นฉบับ)',
      type: 'url',
    }),

    // --- 🔗 ส่วนที่ 7: ความสัมพันธ์ของเนื้อหา ---
    defineField({
      name: 'relatedStories',
      title: 'เรื่องที่เกี่ยวข้อง (เช่น ภาคต่อ/จักรวาลเดียวกัน)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'manga'}]}],
    }),

    // --- 📄 ส่วนที่ 8: SEO ---
    defineField({
      name: 'seoDescription',
      title: 'ข้อความสำหรับ Google (SEO)',
      type: 'text',
      rows: 2,
      description: 'คำอธิบายสั้นๆ ที่จะแสดงบนหน้าค้นหา Google',
      validation: (Rule) => Rule.max(160),
    }),
  ],

  // --- 🎨 ส่วนการแสดงผลในหน้า Sanity Studio (Preview) ---
  preview: {
    select: {
      title: 'title',
      subtitle: 'latestChapter',
      media: 'cover',
      type: 'mangaType',
      updatedDate: 'chapterUpdatedAt', 
    },
    prepare({title, subtitle, media, type, updatedDate}) {
      const typeLabel = type === 'bl_18' ? '🔞 BL 18+' : '🌈 BL ปกติ'
      const dateStr = updatedDate ? new Date(updatedDate).toLocaleDateString('th-TH') : 'ยังไม่ระบุวันที่'
      
      return {
        title: title || 'ยังไม่มีชื่อเรื่อง',
        subtitle: `${typeLabel} | ${subtitle ? subtitle : 'ยังไม่มีตอน'} (${dateStr})`,
        media: media,
      }
    },
  },
})

