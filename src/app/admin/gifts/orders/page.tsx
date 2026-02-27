import React from "react";
import prisma from "@/lib/prisma";
import { Package, MapPin, Calendar, CheckCircle, Clock, Search } from "lucide-react";
import OrderStatusDropdown from "@/components/admin/OrderStatusDropdown";

export const revalidate = 0; // Her zaman güncel veri

export default async function AdminGiftOrdersPage({
    searchParams
}: {
    searchParams: { [key: string]: string | undefined }
}) {
    const statusFilter = searchParams.status || "ALL";

    const whereClause = statusFilter !== "ALL" ? { status: statusFilter } : {};

    const orders = await prisma.giftOrder.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { email: true, name: true } },
            gift: { select: { name: true, price: true, image: true } }
        }
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Package className="text-seal" />
                        Hediye Siparişleri
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Gelen hediye taleplerini yönetin ve durumlarını güncelleyin.</p>
                </div>

                <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm text-sm">
                    {["ALL", "PAID", "PREPARING", "SHIPPED", "COMPLETED"].map((status) => (
                        <a
                            key={status}
                            href={`/admin/gifts/orders?status=${status}`}
                            className={`px-4 py-2 rounded-md transition-colors font-medium ${statusFilter === status
                                ? "bg-slate-100 text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            {status === "ALL" ? "Tümü" :
                                status === "PAID" ? "Yeni" :
                                    status === "PREPARING" ? "Hazırlanıyor" :
                                        status === "SHIPPED" ? "Kargoda" : "Tamamlandı"}
                        </a>
                    ))}
                </div>
            </header>

            {orders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Sipariş Bulunamadı</h3>
                    <p className="text-slate-500 mt-2">Bu kritere uygun herhangi bir hediye siparişi henüz yok.</p>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Ürün & Sipariş Veren</th>
                                    <th className="px-6 py-4">Alıcı Bilgileri</th>
                                    <th className="px-6 py-4">Tutar & Tarih</th>
                                    <th className="px-6 py-4">Durum</th>
                                    <th className="px-6 py-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                                                {order.gift.name}
                                            </div>
                                            <div className="text-xs text-slate-500 mb-2">
                                                Hesap: {order.user.name || order.user.email}
                                            </div>
                                            {(order.senderName || order.senderCity) && (
                                                <div className="text-xs mt-2 bg-slate-50 p-2 border border-slate-100 rounded">
                                                    <span className="font-semibold text-slate-700 block mb-0.5">Gönderen Bilgileri:</span>
                                                    {order.senderName} {order.senderCity ? `(${order.senderCity})` : ''}
                                                    {order.senderAddress && <div className="text-slate-400 mt-0.5 line-clamp-2" title={order.senderAddress}>{order.senderAddress}</div>}
                                                </div>
                                            )}
                                            {order.notes && (
                                                <div className="mt-2 text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-100">
                                                    <strong className="block text-amber-900 mb-0.5">Sipariş Notu:</strong>
                                                    {order.notes}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top max-w-[250px]">
                                            <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                                                {order.receiverName}
                                                {order.isPrison && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Cezaevi</span>}
                                            </div>

                                            {order.isPrison ? (
                                                <div className="text-xs mt-2 space-y-1 text-slate-600 bg-red-50/50 p-2 rounded border border-red-50">
                                                    <div><span className="font-medium">Cezaevi:</span> {order.prisonName}</div>
                                                    <div><span className="font-medium">Şehir:</span> {order.city}</div>
                                                    <div><span className="font-medium">Baba Adı:</span> {order.fatherName}</div>
                                                    <div><span className="font-medium">Koğuş No:</span> {order.wardNumber}</div>
                                                    {order.prisonNote && <div><span className="font-medium">Cezaevi Notu:</span> {order.prisonNote}</div>}
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-xs text-slate-500 flex items-start gap-1.5 mt-2">
                                                        <MapPin size={14} className="shrink-0 mt-0.5 text-slate-400" />
                                                        <span className="line-clamp-3">{order.addressText} {order.city ? `(${order.city})` : ''}</span>
                                                    </div>
                                                    {order.phone && (
                                                        <div className="text-xs text-slate-500 mt-1.5 font-medium ml-5">
                                                            Tel: {order.phone}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top whitespace-nowrap">
                                            <div className="font-black text-emerald-600 text-base mb-1">
                                                {order.pricePaid} <span className="text-sm">🪙</span>
                                            </div>
                                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-2">
                                                <Calendar size={13} />
                                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                            </div>
                                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                <Clock size={13} />
                                                {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <OrderStatusDropdown
                                                orderId={order.id}
                                                currentStatus={order.status}
                                            />
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <div className="flex flex-col gap-2 relative">
                                                {/* İleride Status değiştirme butonu veya modal action buraya eklenecek */}
                                                <a href={`/admin/gifts/orders/${order.id}`} className="text-sm hover:underline text-seal font-medium inline-flex items-center justify-end gap-1">
                                                    Detay <CheckCircle size={14} />
                                                </a>
                                            </div>
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
