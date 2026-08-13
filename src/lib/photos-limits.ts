/** Batas unggah foto. Dipisah dari `photos.ts` agar bisa dipakai komponen klien
 * tanpa menarik sharp & modul filesystem ke bundle browser. */
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const MAX_PHOTOS_PER_ITEM = 3;
