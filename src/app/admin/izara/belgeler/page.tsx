import IzaraDocumentManager from "@/components/admin/IzaraDocumentManager";
export default function IzaraDocumentsPage() {
  return <div className="space-y-6"><header><span className="text-xs font-bold tracking-widest text-amber-700">İZARA · SİTE YÖNETİMİ</span><h2 className="mt-2 text-2xl font-bold text-slate-900">Belgeler ve sertifikalar</h2><p className="mt-2 text-sm text-slate-500">Belge adı ve fotoğraf ekleyin; yayımlanan belgeleri düzenleyin ve sıralayın.</p></header><IzaraDocumentManager/></div>;
}
