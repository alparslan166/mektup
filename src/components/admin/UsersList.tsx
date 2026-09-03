"use client";

import { useState } from "react";
import { Search, Users, Mail, FileText, PenLine } from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  _count: {
    letters: number;
    drafts: number;
  };
}

export default function UsersList({
  initialUsers,
}: {
  initialUsers: AdminUser[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = initialUsers.filter((user) => {
    const q = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="İsim veya e-posta ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
          Toplam {filteredUsers.length} Kullanıcı
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Kullanıcı bulunamadı</h3>
          <p className="text-slate-500 mt-2">
            {searchQuery
              ? "Aramanıza uygun kayıtlı kullanıcı yok."
              : "Henüz kayıtlı kullanıcı bulunmuyor."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">İsim</th>
                  <th className="px-6 py-4">E-posta</th>
                  <th className="px-6 py-4 text-center">Gönderilen</th>
                  <th className="px-6 py-4 text-center">Taslak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {user.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        {user.email || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 min-w-[3rem] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                        <PenLine size={12} />
                        {user._count.letters}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 min-w-[3rem] px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-xs">
                        <FileText size={12} />
                        {user._count.drafts}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
