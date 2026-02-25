import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    console.log("AdminLayout rendering...");
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
