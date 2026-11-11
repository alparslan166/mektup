import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Mail, Settings, Package, ShoppingBag } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-900">Admin Paneli</h1>
                    <div className="flex items-center gap-4">
                        <Link href="/admin/izara/belgeler" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">İZARA Belgeleri</Link>
                        <Link href="/admin/izara/hakkimizda" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">İZARA Hakkımızda</Link>
                        <span className="text-sm text-slate-500">{session.user?.email}</span>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-8 px-6">
                {children}
            </main>
        </div>
    );
}
