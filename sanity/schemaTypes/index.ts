import { type SchemaTypeDefinition } from 'sanity'
import { mangaType } from './manga' // เพิ่มบรรทัดนี้

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [mangaType], // ใส่ mangaType ลงใน Array นี้
}

