import { getAllLetters } from "@/app/actions/adminActions";
import LettersList from "@/components/admin/LettersList";
import { Mail } from "lucide-react";

export default async function AdminLettersPage() {
    const result = await getAllLetters();

    if ("error" in result) {
        return (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
                <p className="text-red-500 font-bold">{result.error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-2">Mektup Yönetimi</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Mail size={16} className="text-blue-500" /> Gelen siparişleri yönetin, hazırlayın ve kargolayın.
                    </p>
                </div>
            </div>

            <LettersList initialLetters={result.letters as any} />
        </div>
    );
}
