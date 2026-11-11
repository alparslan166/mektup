"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";

const endpoint = "/api/admin/izara/about";
const MAX_PARAGRAPHS = 10;

export default function IzaraAboutManager() {
  const [title, setTitle] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([""]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { cache: "no-store", signal: controller.signal }).then(async res => {
      const body = await res.json(); if (!res.ok) throw new Error(body.error || "İçerik alınamadı.");
      if (body.about) { setTitle(body.about.title); setParagraphs(body.about.paragraphs.length ? body.about.paragraphs : [""]); }
      setLoadError(false);
    }).catch(error => { if (error.name !== "AbortError") { setNotice(error.message); setLoadError(true); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const disabled = busy || loading || loadError;
  const edit = (index: number, value: string) => setParagraphs(current => current.map((p, i) => i === index ? value : p));
  const move = (index: number, direction: number) => setParagraphs(current => { const next = [...current]; [next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; });
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;
    const cleaned = paragraphs.map(p => p.trim()).filter(Boolean);
    if (!title.trim() || !cleaned.length) { setNotice("Başlık ve en az bir paragraf gerekli."); return; }
    setBusy(true); setNotice("");
    try {
      const res = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim(), paragraphs: cleaned }) });
      const body = await res.json(); if (!res.ok) throw new Error(body.error || "Kaydedilemedi.");
      setTitle(body.about.title); setParagraphs(body.about.paragraphs);
      setNotice("Kaydedildi. İZARA sitesindeki Hakkımızda bölümü güncellendi.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Kaydedilemedi."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="space-y-6">
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">Burada yazdığınız metin İZARA sitesinin Hakkımızda bölümünde herkese açık gösterilir. Henüz kayıt yoksa sitede varsayılan metin görünür.</div>
    {notice && <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{notice}</p>}
    {loading ? <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={16}/>Yükleniyor…</div> : <>
      <label className="block space-y-2"><span className="text-sm font-semibold text-slate-700">Başlık</span>
        <input value={title} maxLength={120} disabled={disabled} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" placeholder="Sorularınızı ciddiye alan bir araştırma yaklaşımı"/></label>
      <div className="space-y-4">{paragraphs.map((text, index) => <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2"><span className="text-xs font-bold text-slate-500">Paragraf {index + 1}</span>
          <div className="ml-auto flex gap-2">
            <button type="button" aria-label={`Paragraf ${index + 1} yukarı taşı`} disabled={disabled || index === 0} onClick={() => move(index, -1)} className="rounded-lg border p-2 text-slate-600 disabled:opacity-30"><ArrowUp size={16}/></button>
            <button type="button" aria-label={`Paragraf ${index + 1} aşağı taşı`} disabled={disabled || index === paragraphs.length - 1} onClick={() => move(index, 1)} className="rounded-lg border p-2 text-slate-600 disabled:opacity-30"><ArrowDown size={16}/></button>
            <button type="button" aria-label={`Paragraf ${index + 1} sil`} disabled={disabled || paragraphs.length === 1} onClick={() => setParagraphs(current => current.filter((_, i) => i !== index))} className="flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs text-red-600 disabled:opacity-30"><Trash2 size={14}/>Sil</button>
          </div></div>
        <textarea value={text} rows={4} maxLength={1200} disabled={disabled} onChange={e => edit(index, e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed"/>
      </div>)}</div>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={disabled || paragraphs.length >= MAX_PARAGRAPHS} onClick={() => setParagraphs(current => [...current, ""])} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-slate-700 disabled:opacity-30"><Plus size={16}/>Paragraf ekle</button>
        <button type="submit" disabled={disabled} className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{busy ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}Kaydet</button>
      </div></>}
  </form>;
}
