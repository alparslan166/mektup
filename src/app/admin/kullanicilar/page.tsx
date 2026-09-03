import { getAdminUsers } from "@/app/actions/adminActions";
import UsersList from "@/components/admin/UsersList";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const result = await getAdminUsers();

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
                    <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-2">Kullanıcılar</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Users size={16} className="text-blue-500" /> Kayıtlı kullanıcıları ve mektup sayılarını görüntüleyin.
                    </p>
                </div>
            </div>

            <UsersList initialUsers={result.users} />
        </div>
    );
}
