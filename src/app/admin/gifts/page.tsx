import React, { Suspense } from "react";
import { getCategories } from "@/lib/actions/gifts";
import AdminGiftManager from "@/components/admin/AdminGiftManager";
import { Loader2 } from "lucide-react";

async function GiftsList() {
    const categories = await getCategories();
    return <AdminGiftManager categories={categories as any} />;
}

export default function AdminGiftsPage() {
    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-slate-900">Hediye Yönetimi</h2>
                <p className="text-slate-500">Kategorileri ve ürünleri buradan ekleyebilir veya düzenleyebilirsiniz.</p>
            </header>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
                    <p className="text-slate-500 font-medium">Hediyeler yükleniyor...</p>
                </div>
            }>
                <GiftsList />
            </Suspense>
        </div>
    );
}
