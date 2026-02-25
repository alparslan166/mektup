import { getAllLetters } from "@/lib/actions/admin";
import LetterStatusBadge from "@/components/LetterStatusBadge";
import StatusUpdater from "@/components/admin/StatusUpdater";
import Link from "next/link";
import { Gift } from "lucide-react";

export default async function AdminDashboard() {
    const letters = await getAllLetters();

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Tüm Mektuplar</h2>
                    <p className="text-slate-500">Sistemdeki tüm mektupları buradan yönetebilirsiniz.</p>
                </div>
                <Link
                    href="/admin/gifts"
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all text-sm"
                >
                    <Gift size={18} />
                    <span>Hediye Yönetimi</span>
                </Link>
            </header>

            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Kullanıcı</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Tarih</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">Durum</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {letters.map((letter) => (
                            <tr key={letter.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900">{(letter.user as any).name || "İsimsiz"}</div>
                                    <div className="text-xs text-slate-500">{(letter.user as any).email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(letter.createdAt).toLocaleDateString("tr-TR")}
                                </td>
                                <td className="px-6 py-4">
                                    <LetterStatusBadge status={letter.status} />
                                </td>
                                <td className="px-6 py-4">
                                    <StatusUpdater letterId={letter.id} currentStatus={letter.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {letters.length === 0 && (
                    <div className="px-6 py-12 text-center text-slate-500">
                        Henüz oluşturulmuş mektup bulunmuyor.
                    </div>
                )}
            </div>
        </div>
    );
}
