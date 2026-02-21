"use client";

import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    RemoveFormatting,
    Type,
    Palette,
    Highlighter,
    ChevronDown
} from "lucide-react";
import { useLetterStore } from "@/store/letterStore";

interface EditorProps {
    paperColor: string;
}

export default function Editor({ paperColor }: EditorProps) {
    const customFont = "font-kurale"; // Use our nostalgic font
    const updateLetter = useLetterStore(state => state.updateLetter);
    const initialContent = useLetterStore(state => state.letter.content);

    const [rating, setRating] = useState(5); // This seems leftover? No, wait, Editor doesn't need rating.
    const [hoverRating, setHoverRating] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Underline,
            FontFamily,
            Highlight.configure({ multicolor: true })
        ],
        content: initialContent || `<p>Sevgili Gelecek, ...</p>`,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();
            const words = text.trim().split(/\s+/);
            const wordCount = text.trim() === "" ? 0 : words.length;

            updateLetter({
                content: html,
                wordCount: wordCount
            });
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[500px] p-8 sm:p-12 shadow-inner border border-paper-dark/50 rounded-b-lg transition-colors ${customFont} text-lg leading-relaxed`,
                style: `background-color: ${paperColor}; color: var(--ink);`
            }
        }
    });

    if (!editor) {
        return null;
    }

    const fonts = [
        { name: "Kurale", value: "var(--font-kurale)" },
        { name: "Playfair", value: "var(--font-playfair)" },
        { name: "Inter", value: "var(--font-inter)" },
        { name: "Serif", value: "serif" },
        { name: "Monospace", value: "monospace" },
    ];

    const colors = [
        { name: "Varsayılan", value: "var(--ink)" },
        { name: "Toprak", value: "#8b5a2b" },
        { name: "Bordo", value: "#881337" },
        { name: "Mavi", value: "#1e3a8a" },
        { name: "Yeşil", value: "#065f46" },
    ];

    const highlightingColors = [
        { name: "Sarı", value: "#fef08a" },
        { name: "Yeşil", value: "#bbf7d0" },
        { name: "Mavi", value: "#bfdbfe" },
        { name: "Pembe", value: "#fbcfe8" },
        { name: "Hiçbiri", value: "transparent" },
    ];

    return (
        <div className="w-full flex flex-col mt-6 shadow-md rounded-lg overflow-hidden border border-paper-dark relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-wood/10 rounded-full blur-xl pointer-events-none"></div>

            {/* TOOLBAR */}
            <div className="bg-wood-dark text-paper px-4 py-3 flex items-center gap-1 sm:gap-2 flex-wrap border-b-4 border-seal">

                {/* Font Select */}
                <div className="relative group">
                    <button className="flex items-center gap-2 bg-paper/10 hover:bg-paper/20 px-3 py-1.5 rounded-md transition-colors min-w-[100px] justify-between">
                        <div className="flex items-center gap-2">
                            <Type size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">Yazı Tipi</span>
                        </div>
                        <ChevronDown size={14} className="opacity-50" />
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-40 bg-paper border border-paper-dark shadow-xl rounded-md overflow-hidden z-20 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-200">
                        {fonts.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => editor.chain().focus().setFontFamily(f.value).run()}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-paper-dark transition-colors text-wood-dark font-medium ${editor.isActive('textStyle', { fontFamily: f.value }) ? 'bg-paper-dark font-bold' : ''}`}
                                style={{ fontFamily: f.value }}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-px h-6 bg-paper/20 mx-1"></div>

                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded transition-all duration-200 border-2 ${editor.isActive("bold")
                        ? "bg-seal border-seal text-paper shadow-inner scale-95"
                        : "bg-transparent border-transparent hover:bg-paper/10 text-paper"
                        }`}
                    title="Kalın"
                >
                    <Bold size={18} strokeWidth={editor.isActive("bold") ? 3 : 2} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded transition-all duration-200 border-2 ${editor.isActive("italic")
                        ? "bg-seal border-seal text-paper shadow-inner scale-95"
                        : "bg-transparent border-transparent hover:bg-paper/10 text-paper"
                        }`}
                    title="İtalik"
                >
                    <Italic size={18} strokeWidth={editor.isActive("italic") ? 2.5 : 2} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded transition-all duration-200 border-2 ${editor.isActive("underline")
                        ? "bg-seal border-seal text-paper shadow-inner scale-95"
                        : "bg-transparent border-transparent hover:bg-paper/10 text-paper"
                        }`}
                    title="Altı Çizili"
                >
                    <UnderlineIcon size={18} strokeWidth={editor.isActive("underline") ? 2.5 : 2} />
                </button>

                <div className="w-px h-6 bg-paper/20 mx-1"></div>

                {/* Color Picker */}
                <div className="relative group">
                    <button className="p-2 rounded hover:bg-paper/10 transition-colors flex items-center gap-1" title="Yazı Rengi">
                        <Palette size={18} />
                        <ChevronDown size={12} className="opacity-50" />
                    </button>
                    <div className="absolute top-full left-0 mt-1 p-2 bg-paper border border-paper-dark shadow-xl rounded-md z-20 hidden group-hover:flex gap-2 animate-in fade-in duration-200">
                        {colors.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => editor.chain().focus().setColor(c.value).run()}
                                className="w-6 h-6 rounded-full border border-paper-dark hover:scale-110 transition-transform shadow-sm"
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                {/* Highlight Picker */}
                <div className="relative group">
                    <button className="p-2 rounded hover:bg-paper/10 transition-colors flex items-center gap-1" title="Vurgu Rengi">
                        <Highlighter size={18} />
                        <ChevronDown size={12} className="opacity-50" />
                    </button>
                    <div className="absolute top-full left-0 mt-1 p-2 bg-paper border border-paper-dark shadow-xl rounded-md z-20 hidden group-hover:flex gap-2 animate-in fade-in duration-200">
                        {highlightingColors.map((c) => (
                            <button
                                key={c.value}
                                onClick={() => c.value === 'transparent' ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().setHighlight({ color: c.value }).run()}
                                className="w-6 h-6 rounded border border-paper-dark hover:scale-110 transition-transform shadow-sm relative overflow-hidden"
                                style={{ backgroundColor: c.value }}
                                title={c.name}
                            >
                                {c.value === 'transparent' && <div className="absolute inset-0 bg-red-500 hover:bg-red-600 rotate-45 scale-x-150 h-px top-1/2" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-px h-6 bg-paper/20 mx-1"></div>

                <button
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    className="p-2 rounded hover:bg-paper/20 transition-colors text-paper/70 hover:text-paper"
                    title="Biçimi Temizle"
                >
                    <RemoveFormatting size={18} />
                </button>
            </div>

            {/* EDITOR CONTENT AREA */}
            <div className="relative">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
