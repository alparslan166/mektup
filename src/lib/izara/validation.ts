export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
export const MAX_DOCUMENTS = 50;
export const DOCUMENT_PREFIX = "izara/documents/";
export const DOCUMENT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class DocumentError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export function parseTitle(value: unknown) {
  if (typeof value !== "string") throw new DocumentError("Belge adı gerekli.");
  const title = value.trim();
  if (!title || title.length > 100) throw new DocumentError("Belge adı 1–100 karakter olmalıdır.");
  return title;
}
export function parseOrder(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > MAX_DOCUMENTS || value.some(id => typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) || new Set(value).size !== value.length) {
    throw new DocumentError("Belge sıralaması geçersiz.");
  }
  return value;
}
export function validateFileDetails(file: File) {
  if (!DOCUMENT_MIME_TYPES.includes(file.type)) throw new DocumentError("Yalnızca JPG, PNG ve WebP fotoğraf yükleyebilirsiniz.");
  if (!file.size || file.size > MAX_DOCUMENT_BYTES) throw new DocumentError("Fotoğraf boyutu 0–4 MB aralığında olmalıdır.");
}
