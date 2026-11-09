"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileImage, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Document = { id: string; title: string; imageUrl: string; order: number };
const endpoint = "/api/admin/izara/documents";

export default function IzaraDocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [title, setTitle] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { cache: "no-store", signal: controller.signal }).then(async res => {
      const body = await res.json(); if (!res.ok) throw new Error(body.error || "Belgeler alınamadı.");
      setDocuments(body.documents); setLoadError(false);
    }).catch(error => { if (error.name !== "AbortError") { setNotice(error.message); setLoadError(true); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!photo) { setPreview(""); return; }
    const url = URL.createObjectURL(photo); setPreview(url); return () => URL.revokeObjectURL(url);
  }, [photo]);
  function clearForm() {
    setEditing(null); setTitle(""); setPhoto(null);
    if (fileInput.current) fileInput.current.value = "";
  }
  function selectFile(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 4 * 1024 * 1024) {
      setNotice("En fazla 4 MB boyutunda JPG, PNG veya WebP fotoğraf seçin.");
      if (fileInput.current) fileInput.current.value = "";
      setPhoto(null); return;
    }
    setNotice(""); setPhoto(file);
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || loading || loadError) return;
    if (!title.trim() || (!editing && !photo)) { setNotice("Belge adı ve fotoğrafı gerekli."); return; }
    setBusy(true); setNotice("");
    try {
      const form = new FormData(); form.set("title", title.trim()); if (photo) form.set("photo", photo);
      const res = await fetch(editing ? `${endpoint}/${editing.id}` : endpoint, { method: editing ? "PATCH" : "POST", body: form });
      const body = await res.json(); if (!res.ok) throw new Error(body.error || "Belge kaydedilemedi.");
      setDocuments(current => editing ? current.map(d => d.id === editing.id ? body.document : d) : [...current, body.document]);
      clearForm(); setNotice("Belge kaydedildi. İZARA sitesindeki belge listesi güncellendi.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Belge kaydedilemedi."); }
    finally { setBusy(false); }
  }
  async function remove(document: Document) {
    if (!window.confirm(`“${document.title}” belgesini ve fotoğrafını silmek istediğinize emin misiniz?`)) return;
    setBusy(true); setNotice("");
    try {
      const res = await fetch(`${endpoint}/${document.id}`, { method: "DELETE" }); const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Belge silinemedi.");
      setDocuments(current => current.filter(d => d.id !== document.id));
      if (editing?.id === document.id) clearForm(); setNotice("Belge silindi.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Belge silinemedi."); }
    finally { setBusy(false); }
  }
  async function move(index: number, direction: number) {
    const updated = [...documents];
    [updated[index], updated[index + direction]] = [updated[index + direction], updated[index]];
    setBusy(true); setNotice("");
    try {
      const res = await fetch(`${endpoint}/order`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: updated.map(d => d.id) }) });
      const body = await res.json(); if (!res.ok) throw new Error(body.error || "Sıralama kaydedilemedi.");
      setDocuments(updated.map((d, order) => ({ ...d, order }))); setNotice("Belge sıralaması güncellendi.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Sıralama kaydedilemedi."); }
    finally { setBusy(false); }
  }
  const disabled = busy || loading || loadError;
  return <div className="space-y-7">
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">Burada kaydettiğiniz belge adı ve fotoğraf İZARA sitesinde herkese açık gösterilir. Yalnızca yayımlamak istediğiniz belgeleri yükleyin.</div>
    {notice && <p role="status" className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{notice}</p>}
    <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4"><h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><FileImage size={21}/>{editing ? "Belgeyi düzenle" : "Yeni belge"}</h3>{editing && <button type="button" onClick={clearForm} disabled={busy} className="flex items-center gap-1 text-sm text-slate-500"><X size={16}/>Vazgeç</button>}</div>
      <fieldset disabled={disabled} className="grid gap-5 md:grid-cols-2 disabled:opacity-60">
        <div><label htmlFor="izara-title" className="mb-2 block text-sm font-semibold text-slate-700">Belge adı</label><input ref={titleInput} id="izara-title" value={title} onChange={e => setTitle(e.target.value)} required maxLength={100} placeholder="Örn. Eğitim sertifikası" className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-amber-500"/>
        <label htmlFor="izara-photo" className="mb-2 mt-5 block text-sm font-semibold text-slate-700">Belge fotoğrafı{editing && <span className="ml-1 font-normal text-slate-500">(değiştirmek için seçin)</span>}</label><input ref={fileInput} id="izara-photo" type="file" accept="image/jpeg,image/png,image/webp" required={!editing} onChange={e => selectFile(e.target.files?.[0])} className="block max-w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-3 file:font-semibold"/><p className="mt-2 text-xs text-slate-500">JPG, PNG veya WebP · En fazla 4 MB</p></div>
        <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">{preview || editing?.imageUrl ? <img src={preview || editing!.imageUrl} alt="Belge fotoğrafı önizlemesi" className="max-h-64 max-w-full object-contain"/> : <div className="text-center text-slate-400"><FileImage size={40} className="mx-auto mb-3"/><p className="text-sm">Fotoğraf önizlemesi</p></div>}</div>
        <button type="submit" className="flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-wait">{busy ? <Loader2 size={18} className="animate-spin"/> : editing ? <Save size={18}/> : <Plus size={18}/>} {editing ? "Değişiklikleri kaydet" : "Belgeyi ekle"}</button>
      </fieldset>
    </form>
    <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-slate-900">Yayımlanan belgeler <span className="text-sm font-normal text-slate-400">({documents.length})</span></h3><span className="text-xs text-slate-500">Oklarla sıralayabilirsiniz.</span></div>
    {loading ? <p role="status" className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={18}/>Belgeler yükleniyor…</p> : loadError ? <button onClick={() => window.location.reload()} className="text-sm font-semibold text-slate-700 underline">Yeniden deneyin</button> : documents.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Henüz belge eklenmedi. İlk belgenizi yukarıdaki formdan yükleyebilirsiniz.</div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{documents.map((document, index) => <article key={document.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><a href={document.imageUrl} target="_blank" rel="noopener noreferrer" className="flex h-60 items-center justify-center bg-slate-100 p-4"><img src={document.imageUrl} alt={document.title} loading="lazy" className="max-h-full max-w-full object-contain"/></a><div className="p-4"><h4 className="break-words font-semibold text-slate-900">{document.title}</h4><div className="mt-4 flex flex-wrap items-center gap-2"><button aria-label={`${document.title} belgesini yukarı taşı`} disabled={disabled || index === 0} onClick={() => move(index, -1)} className="rounded-lg border p-2 text-slate-600 disabled:opacity-30"><ArrowUp size={16}/></button><button aria-label={`${document.title} belgesini aşağı taşı`} disabled={disabled || index === documents.length - 1} onClick={() => move(index, 1)} className="rounded-lg border p-2 text-slate-600 disabled:opacity-30"><ArrowDown size={16}/></button><button disabled={disabled} onClick={() => { setEditing(document); setTitle(document.title); setPhoto(null); if (fileInput.current) fileInput.current.value = ""; setNotice(""); titleInput.current?.focus(); }} className="ml-auto flex items-center gap-1 rounded-lg border px-3 py-2 text-xs text-slate-700 disabled:opacity-30"><Pencil size={14}/>Düzenle</button><button disabled={disabled} onClick={() => remove(document)} className="flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs text-red-600 disabled:opacity-30"><Trash2 size={14}/>Sil</button></div></div></article>)}</div>}
  </div>;
}
