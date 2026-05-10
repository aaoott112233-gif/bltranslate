import { type SchemaTypeDefinition } from 'sanity'
import { mangaType } from './manga' // เพิ่มบรรทัดนี้
import { siteConfig } from './siteConfig'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [mangaType, siteConfig], // ใส่ mangaType ลงใน Array นี้
}

