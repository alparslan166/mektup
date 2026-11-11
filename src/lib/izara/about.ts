import { DocumentError } from "./validation";

export const ABOUT_ID = "main";
export const MAX_ABOUT_PARAGRAPHS = 10;
export const MAX_ABOUT_TITLE = 120;
export const MAX_ABOUT_PARAGRAPH = 1200;
export const publicAboutSelect = { title: true, paragraphs: true };

export function parseAbout(value: unknown) {
  const body = (value ?? {}) as { title?: unknown; paragraphs?: unknown };
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title || title.length > MAX_ABOUT_TITLE) throw new DocumentError(`Başlık 1–${MAX_ABOUT_TITLE} karakter olmalıdır.`);
  if (!Array.isArray(body.paragraphs) || body.paragraphs.some(p => typeof p !== "string")) throw new DocumentError("Paragraflar geçersiz.");
  const paragraphs = (body.paragraphs as string[]).map(p => p.trim()).filter(Boolean);
  if (!paragraphs.length || paragraphs.length > MAX_ABOUT_PARAGRAPHS) throw new DocumentError(`1–${MAX_ABOUT_PARAGRAPHS} paragraf girin.`);
  if (paragraphs.some(p => p.length > MAX_ABOUT_PARAGRAPH)) throw new DocumentError(`Her paragraf en fazla ${MAX_ABOUT_PARAGRAPH} karakter olabilir.`);
  return { title, paragraphs };
}
