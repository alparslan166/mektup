"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, Package, FolderPlus, Save, X, Image as ImageIcon, GripVertical } from "lucide-react";
import { toast } from "react-hot-toast";
import { createCategory, updateCategory, deleteCategory, createGift, updateGift, deleteGift, reorderCategories, reorderGifts } from "@/lib/actions/gifts";
import { useUIStore } from "@/store/uiStore";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Image from "next/image";

interface Gift {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    image: string | null;
}

interface Category {
    id: string;
    name: string;
    gifts: Gift[];
}

export default function AdminGiftManager({ categories: initialCategories }: { categories: Category[] }) {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editCategoryName, setEditCategoryName] = useState("");

    const [addingGiftToCategoryId, setAddingGiftToCategoryId] = useState<string | null>(null);
    const [newGiftData, setNewGiftData] = useState({ name: "", description: "", price: "", image: "", previewImage: "" });
    const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
    const [editGiftData, setEditGiftData] = useState({ name: "", description: "", price: "", image: "", previewImage: "" });
    const [isUploading, setIsUploading] = useState(false);
    const { setIsLoading } = useUIStore();

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, type } = result;
        if (!destination) return;
        if (destination.index === source.index && destination.droppableId === source.droppableId) return;

        if (type === "category") {
            const items = Array.from(categories);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);

            setCategories(items as any);
            try {
                await reorderCategories(items.map(item => item.id));
                toast.success("Kategori sırası güncellendi");
            } catch (error) {
                toast.error("Sıralama güncellenemedi");
            }
        } else if (type === "gift") {
            const categoryId = source.droppableId.replace("gifts-", "");
            const category = categories.find(c => c.id === categoryId);
            if (!category) return;

            const items = Array.from(category.gifts);
            const [reorderedItem] = items.splice(source.index, 1);
            items.splice(destination.index, 0, reorderedItem);

            const updatedCategories = categories.map(c => {
                if (c.id === categoryId) {
                    return { ...c, gifts: items };
                }
                return c;
            });
            setCategories(updatedCategories as any);

            try {
                await reorderGifts(items.map(item => item.id));
                toast.success("Ürün sırası güncellendi");
            } catch (error) {
                toast.error("Sıralama güncellenemedi");
            }
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsLoading(true);
        try {
            const category = await createCategory(newCategoryName);
            setCategories(prev => [...prev, { ...category, gifts: [] } as Category]);
            setNewCategoryName("");
            setIsAddingCategory(false);
            toast.success("Kategori eklendi");
        } catch (error) {
            toast.error("Kategori eklenemedi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCategory = async (id: string) => {
        if (!editCategoryName.trim()) return;
        setIsLoading(true);
        try {
            const updatedCategory = await updateCategory(id, editCategoryName);
            setCategories(prev => prev.map(c => c.id === id ? { ...c, name: updatedCategory.name } : c));
            setEditingCategoryId(null);
            toast.success("Kategori güncellendi");
        } catch (error) {
            toast.error("Kategori güncellenemedi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Bu kategoriyi ve içindeki tüm hediyeleri silmek istediğinize emin misiniz?")) return;

        // Optimistic update
        const previousCategories = [...categories];
        setCategories(categories.filter(c => c.id !== id));

        setIsLoading(true);
        try {
            await deleteCategory(id);
            toast.success("Kategori silindi");
        } catch (error) {
            setCategories(previousCategories);
            toast.error("Kategori silinemedi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGift = async (categoryId: string) => {
        if (!newGiftData.name.trim()) return;
        setIsLoading(true);
        try {
            const gift = await createGift({
                name: newGiftData.name,
                description: newGiftData.description,
                price: newGiftData.price ? parseFloat(newGiftData.price) : undefined,
                image: newGiftData.image || undefined,
                categoryId
            });
            setCategories(prev => prev.map(c =>
                c.id === categoryId ? { ...c, gifts: [...c.gifts, gift as Gift] } : c
            ));
            setNewGiftData({ name: "", description: "", price: "", image: "", previewImage: "" });
            setAddingGiftToCategoryId(null);
            toast.success("Hediye eklendi");
        } catch (error) {
            toast.error("Hediye eklenemedi");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateGift = async (id: string) => {
        if (!editGiftData.name.trim()) return;
        setIsLoading(true);
        try {
            const updatedGift = await updateGift(id, {
                name: editGiftData.name,
                description: editGiftData.description,
                price: editGiftData.price ? parseFloat(editGiftData.price) : undefined,
                image: editGiftData.image || undefined
            });
            setCategories(prev => prev.map(c => ({
                ...c,
                gifts: c.gifts.map(g => g.id === id ? { ...g, ...updatedGift } : g)
            })));
            setEditingGiftId(null);
            setEditGiftData({ name: "", description: "", price: "", image: "", previewImage: "" });
            toast.success("Hediye güncellendi");
        } catch (error) {
            console.error("Hediye güncelleme hatası:", error);
            toast.error("Hediye güncellenemedi: " + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "new" | "edit" = "new") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const loadingToast = toast.loading("Görsel yükleniyor...");

        try {
            // 1. Get Presigned URL
            const res = await fetch("/api/upload", {
                method: "POST",
                body: JSON.stringify({
                    fileName: file.name,
                    fileType: file.type
                }),
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) throw new Error("Presigned URL alınamadı");
            const { uploadUrl, publicUrl, previewUrl } = await res.json();

            // 2. Upload directly to S3
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (uploadRes.ok) {
                if (type === "new") {
                    setNewGiftData(prev => ({ ...prev, image: publicUrl, previewImage: previewUrl }));
                } else {
                    setEditGiftData(prev => ({ ...prev, image: publicUrl, previewImage: previewUrl }));
                }
                toast.success("Görsel yüklendi", { id: loadingToast });
            } else {
                const errorText = await uploadRes.text();
                console.error("S3 Upload Error Response:", errorText);
                throw new Error(`S3 yükleme başarısız: ${uploadRes.status} ${uploadRes.statusText}`);
            }
        } catch (error) {
            console.error("Upload error details:", error);
            toast.error("Görsel yüklenemedi: " + (error as Error).message, { id: loadingToast });
        } finally {
            setIsUploading(false);
            // Reset the input value so the same file can be selected again
            e.target.value = "";
        }
    };

    const handleDeleteGift = async (id: string) => {
        if (!confirm("Bu hediyeyi silmek istediğinize emin misiniz?")) return;

        // Optimistic update
        const previousCategories = [...categories];
        setCategories(categories.map(c => ({
            ...c,
            gifts: c.gifts.filter(g => g.id !== id)
        })));

        setIsLoading(true);
        try {
            await deleteGift(id);
            toast.success("Hediye silindi");
        } catch (error) {
            setCategories(previousCategories);
            toast.error("Hediye silinemedi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Hediyeler ve Kategoriler</h3>
                    <p className="text-sm text-slate-500">Hediye seçeneklerini buradan yönetebilirsiniz.</p>
                </div>
                <button
                    onClick={() => setIsAddingCategory(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all text-sm"
                >
                    <FolderPlus size={18} />
                    <span>Yeni Kategori</span>
                </button>
            </div>

            {isAddingCategory && (
                <div className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-300 flex items-center gap-4">
                    <input
                        className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                        placeholder="Kategori Adı (örn: Kitaplar)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                    />
                    <button onClick={handleAddCategory} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">Kaydet</button>
                    <button onClick={() => setIsAddingCategory(false)} className="text-slate-500 hover:text-slate-700">İptal</button>
                </div>
            )}

            <div className="space-y-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="categories" type="category">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                {categories.map((category, index) => (
                                    <Draggable key={category.id} draggableId={category.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
                                            >
                                                <div
                                                    onClick={() => toggleCategory(category.id)}
                                                    className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1">
                                                            <GripVertical size={18} />
                                                        </div>
                                                        <button>
                                                            {expandedCategories.includes(category.id) ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                                                        </button>

                                                        {editingCategoryId === category.id ? (
                                                            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 mr-2">
                                                                <input
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="border border-slate-300 rounded-md px-2 py-1 text-sm outline-none bg-white font-medium flex-1 min-w-0"
                                                                    value={editCategoryName}
                                                                    onChange={(e) => setEditCategoryName(e.target.value)}
                                                                    autoFocus
                                                                    onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory(category.id)}
                                                                />
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleUpdateCategory(category.id);
                                                                    }}
                                                                    className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors shrink-0"
                                                                    title="Kaydet"
                                                                >
                                                                    <Save size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setEditingCategoryId(null);
                                                                    }}
                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
                                                                    title="İptal"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm truncate mr-2 flex-1">{category.name}</h4>
                                                        )}

                                                        <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                                                            {category.gifts.length} ÜRÜN
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingCategoryId(category.id);
                                                                setEditCategoryName(category.name);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteCategory(category.id);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {expandedCategories.includes(category.id) && (
                                                    <div className="p-4">
                                                        <Droppable droppableId={`gifts-${category.id}`} type="gift">
                                                            {(provided) => (
                                                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                                                    {category.gifts.map((gift, index) => (
                                                                        <Draggable key={gift.id} draggableId={gift.id} index={index}>
                                                                            {(provided) => (
                                                                                <div
                                                                                    ref={provided.innerRef}
                                                                                    {...provided.draggableProps}
                                                                                    className="space-y-3"
                                                                                >
                                                                                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                                                                        <div className="flex items-center gap-4">
                                                                                            <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing">
                                                                                                <GripVertical size={16} />
                                                                                            </div>
                                                                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden shrink-0 relative">
                                                                                                {gift.image ? (
                                                                                                    <Image src={gift.image} alt={gift.name} fill sizes="40px" className="object-cover" />
                                                                                                ) : (
                                                                                                    <Package size={20} />
                                                                                                )}
                                                                                            </div>
                                                                                            <div>
                                                                                                <div className="font-bold text-slate-900 text-sm">{gift.name}</div>
                                                                                                <div className="text-xs text-slate-500 line-clamp-1">{gift.description || "Açıklama yok"}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <div className="text-sm font-bold text-slate-900 mr-2">{gift.price ? `${gift.price} 🪙` : "-"}</div>
                                                                                            <button
                                                                                                onClick={() => {
                                                                                                    setEditingGiftId(gift.id);
                                                                                                    setEditGiftData({
                                                                                                        name: gift.name,
                                                                                                        description: gift.description || "",
                                                                                                        price: gift.price?.toString() || "",
                                                                                                        image: gift.image || "",
                                                                                                        previewImage: gift.image || ""
                                                                                                    });
                                                                                                }}
                                                                                                className="p-1.5 text-slate-300 hover:text-blue-500 transition-colors"
                                                                                            >
                                                                                                <Edit2 size={16} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() => handleDeleteGift(gift.id)}
                                                                                                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                                                                            >
                                                                                                <Trash2 size={16} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>

                                                                                    {editingGiftId === gift.id && (
                                                                                        <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
                                                                                            <div className="flex justify-between items-center mb-2">
                                                                                                <h5 className="text-sm font-bold text-slate-700">Ürünü Düzenle</h5>
                                                                                                <button onClick={() => setEditingGiftId(null)} className="text-slate-400 hover:text-slate-600">
                                                                                                    <X size={16} />
                                                                                                </button>
                                                                                            </div>
                                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                                <input
                                                                                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white font-medium"
                                                                                                    placeholder="Ürün ismi"
                                                                                                    value={editGiftData.name}
                                                                                                    onChange={(e) => setEditGiftData({ ...editGiftData, name: e.target.value })}
                                                                                                />
                                                                                                <input
                                                                                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none bg-white font-medium"
                                                                                                    placeholder="Fiyat (Kredi)"
                                                                                                    type="number"
                                                                                                    min="0"
                                                                                                    value={editGiftData.price}
                                                                                                    onChange={(e) => setEditGiftData({ ...editGiftData, price: e.target.value })}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="grid grid-cols-2 gap-4 items-center">
                                                                                                <div className="relative group">
                                                                                                    <input
                                                                                                        type="file"
                                                                                                        id={`edit-gift-image-${gift.id}`}
                                                                                                        className="hidden"
                                                                                                        accept="image/*"
                                                                                                        onChange={(e) => handleImageUpload(e, "edit")}
                                                                                                        disabled={isUploading}
                                                                                                    />
                                                                                                    <label
                                                                                                        htmlFor={`edit-gift-image-${gift.id}`}
                                                                                                        className="flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-white bg-slate-50 transition-colors font-medium text-slate-600"
                                                                                                    >
                                                                                                        {isUploading ? (
                                                                                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                                                                                        ) : (
                                                                                                            <ImageIcon size={16} />
                                                                                                        )}
                                                                                                        <span>{editGiftData.previewImage ? "Görseli Değiştir" : "Görsel Ekle"}</span>
                                                                                                    </label>
                                                                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Önerilen: 1:1 Kare Format</p>
                                                                                                </div>
                                                                                                {editGiftData.previewImage && (
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden bg-white relative">
                                                                                                            <Image src={editGiftData.previewImage} alt="Önizleme" fill sizes="40px" className="object-cover" />
                                                                                                        </div>
                                                                                                        <button
                                                                                                            onClick={() => setEditGiftData(prev => ({ ...prev, image: "", previewImage: "" }))}
                                                                                                            className="text-xs text-red-500 font-bold"
                                                                                                        >
                                                                                                            Kaldır
                                                                                                        </button>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <textarea
                                                                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none bg-white font-medium"
                                                                                                placeholder="Ürün açıklaması"
                                                                                                rows={2}
                                                                                                value={editGiftData.description}
                                                                                                onChange={(e) => setEditGiftData({ ...editGiftData, description: e.target.value })}
                                                                                            />
                                                                                            <div className="flex justify-end gap-2">
                                                                                                <button onClick={() => setEditingGiftId(null)} className="text-xs font-bold text-slate-500 px-3 py-1.5 hover:text-slate-700">İptal</button>
                                                                                                <button onClick={() => handleUpdateGift(gift.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                                                                                                    <Save size={14} />
                                                                                                    <span>Güncelle</span>
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {provided.placeholder}

                                                                    {addingGiftToCategoryId === category.id ? (
                                                                        <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-4">
                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <input
                                                                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                                                                                    placeholder="Ürün ismi"
                                                                                    value={newGiftData.name}
                                                                                    onChange={(e) => setNewGiftData({ ...newGiftData, name: e.target.value })}
                                                                                />
                                                                                <input
                                                                                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                                                                                    placeholder="Fiyat (Kredi)"
                                                                                    type="number"
                                                                                    min="0"
                                                                                    value={newGiftData.price}
                                                                                    onChange={(e) => setNewGiftData({ ...newGiftData, price: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-4 items-center">
                                                                                <div className="relative group">
                                                                                    <input
                                                                                        type="file"
                                                                                        id={`gift-image-${category.id}`}
                                                                                        className="hidden"
                                                                                        accept="image/*"
                                                                                        onChange={handleImageUpload}
                                                                                        disabled={isUploading}
                                                                                    />
                                                                                    <label
                                                                                        htmlFor={`gift-image-${category.id}`}
                                                                                        className="flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                                                                    >
                                                                                        {isUploading ? (
                                                                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                                                                        ) : (
                                                                                            <Plus size={16} />
                                                                                        )}
                                                                                        <span>{newGiftData.previewImage ? "Görseli Değiştir" : "Görsel Ekle"}</span>
                                                                                    </label>
                                                                                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Önerilen: 1:1 Kare Format</p>
                                                                                </div>
                                                                                {newGiftData.previewImage && (
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden relative">
                                                                                            <Image src={newGiftData.previewImage} alt="Önizleme" fill sizes="40px" className="object-cover" />
                                                                                        </div>
                                                                                        <button
                                                                                            onClick={() => setNewGiftData(prev => ({ ...prev, image: "", previewImage: "" }))}
                                                                                            className="text-xs text-red-500 font-bold"
                                                                                        >
                                                                                            Kaldır
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <textarea
                                                                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none"
                                                                                placeholder="Ürün açıklaması"
                                                                                rows={2}
                                                                                value={newGiftData.description}
                                                                                onChange={(e) => setNewGiftData({ ...newGiftData, description: e.target.value })}
                                                                            />
                                                                            <div className="flex justify-end gap-2">
                                                                                <button onClick={() => setAddingGiftToCategoryId(null)} className="text-xs font-bold text-slate-500 px-3 py-1.5">İptal</button>
                                                                                <button onClick={() => handleAddGift(category.id)} className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-lg">Ürünü Ekle</button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => setAddingGiftToCategoryId(category.id)}
                                                                            className="w-full py-3 border border-dashed border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all text-sm font-medium flex items-center justify-center gap-2"
                                                                        >
                                                                            <Plus size={16} />
                                                                            <span>Bu Kategoriye Ürün Ekle</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {categories.length === 0 && !isAddingCategory && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Package size={32} />
                    </div>
                    <h4 className="text-slate-900 font-bold mb-1">Henüz kategori yok</h4>
                    <p className="text-slate-500 text-sm mb-6">Hediye eklemek için önce bir kategori oluşturun.</p>
                    <button
                        onClick={() => setIsAddingCategory(true)}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all text-sm"
                    >
                        Kategori Oluştur
                    </button>
                </div>
            )}
        </div>
    );
}
