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
import { useEffect, useRef } from "react";

interface EditorProps {
    paperColor: string;
}

export default function Editor({ paperColor }: EditorProps) {
    const customFont = "font-kurale"; // Use our nostalgic font
    const updateLetter = useLetterStore(state => state.updateLetter);
    const initialContent = useLetterStore(state => state.letter.content);

    // We use this to force a re-render on every transaction (e.g. clicking Bold/Italic)
    // to ensure the toolbar buttons light up instantly even without typing.
    const [, setUpdate] = useState(0);

    // State for click-to-open menus
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        onTransaction: () => {
            // Force re-render to update toolbar button states
            setUpdate(s => s + 1);
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

    // Helper to check if a mark is active (including stored marks for instant feedback)
    const isMarkActive = (name: string) => {
        if (editor.isActive(name)) return true;

        // Check stored marks (what will be applied next)
        const { storedMarks } = editor.state;
        if (storedMarks) {
            return !!storedMarks.find(mark => mark.type.name === name);
        }
        return false;
    };

    // Helper to get active attribute (color, fontFamily, etc.)
    const getActiveAttr = (type: string, attr: string) => {
        // 1. Check selection attributes
        const attrs = editor.getAttributes(type);
        if (attrs && attrs[attr]) return attrs[attr];

        // 2. Check stored marks (what will be applied next)
        const { storedMarks } = editor.state;
        if (storedMarks) {
            const mark = storedMarks.find(m => m.type.name === type);
            if (mark?.attrs[attr]) return mark.attrs[attr];
        }

        // 3. Fallback: check marks at the current selection start
        const { $from } = editor.state.selection;
        const marks = $from.marks();
        const mark = marks.find(m => m.type.name === type);
        if (mark?.attrs[attr]) return mark.attrs[attr];

        return null;
    };

    const activeFont = getActiveAttr('textStyle', 'fontFamily');
    const activeColor = getActiveAttr('textStyle', 'color') || 'var(--ink)';
    const activeHighlight = getActiveAttr('highlight', 'color') || 'transparent';

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
            <div
                ref={toolbarRef}
                className="bg-wood-dark text-paper px-4 py-3 flex items-center gap-1 sm:gap-2 flex-wrap border-b-4 border-seal relative"
            >

                {/* Font Select */}
                <div className="relative">
                    <button
                        onClick={() => setActiveMenu(activeMenu === 'font' ? null : 'font')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors min-w-[120px] justify-between border-2 ${activeMenu === 'font' ? 'bg-seal border-seal shadow-inner' : 'bg-paper/10 border-transparent hover:bg-paper/20'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Type size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                {fonts.find(f => f.value === activeFont)?.name || (activeFont === 'var(--font-kurale)' || !activeFont ? "Kurale" : "Yazı Tipi")}
                            </span>
                        </div>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${activeMenu === 'font' ? 'rotate-180 opacity-100' : 'opacity-50'}`} />
                    </button>
                    {activeMenu === 'font' && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-paper border border-paper-dark shadow-xl rounded-md overflow-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-200">
                            {fonts.map((f) => (
                                <button
                                    key={f.value}
                                    onClick={() => {
                                        editor.chain().focus().setFontFamily(f.value).run();
                                        setActiveMenu(null);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-paper-dark transition-colors text-wood-dark font-medium ${(activeFont === f.value || (!activeFont && f.name === "Kurale")) ? 'bg-paper-dark font-bold' : ''}`}
                                    style={{ fontFamily: f.value }}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-paper/20 mx-1"></div>

                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded transition-all duration-200 border-2 ${isMarkActive("bold")
                        ? "bg-seal border-seal text-paper shadow-inner scale-95"
                        : "bg-transparent border-transparent hover:bg-paper/10 text-paper"
                        }`}
                    title="Kalın"
                >
                    <Bold size={18} strokeWidth={isMarkActive("bold") ? 3 : 2} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded transition-all border-2 ${isMarkActive("italic")
                        ? "bg-seal border-seal text-paper shadow-inner scale-95"
                        : "bg-transparent border-transparent hover:bg-paper/10 text-paper"
                        }`}
                    title="İtalik"
                >
                    <Italic size={18} strokeWidth={isMarkActive("italic") ? 2.5 : 2} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 rounded transition-all duration-200 border-2 ${isMarkActive("underline")
                        ? "bg-seal border-seal text-paper shadow-inner scale-95"
                        : "bg-transparent border-transparent hover:bg-paper/10 text-paper"
                        }`}
                    title="Altı Çizili"
                >
                    <UnderlineIcon size={18} strokeWidth={isMarkActive("underline") ? 2.5 : 2} />
                </button>

                <div className="w-px h-6 bg-paper/20 mx-1"></div>

                {/* Color Picker */}
                <div className="relative">
                    <button
                        onClick={() => setActiveMenu(activeMenu === 'color' ? null : 'color')}
                        className={`p-2 rounded transition-all flex flex-col items-center gap-0.5 border-2 ${activeMenu === 'color' ? 'bg-seal/20 border-seal shadow-inner' : (activeColor !== 'var(--ink)' ? 'bg-seal border-seal text-paper shadow-inner' : 'bg-transparent border-transparent hover:bg-paper/10 text-paper')}`}
                        title="Yazı Rengi"
                    >
                        <Palette size={18} />
                        <div
                            className="w-4 h-1 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.5)] border border-white/20"
                            style={{ backgroundColor: activeColor }}
                        />
                    </button>
                    {activeMenu === 'color' && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-paper border border-paper-dark shadow-xl rounded-md z-20 flex gap-2 animate-in fade-in duration-200">
                            {colors.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => {
                                        editor.chain().focus().setColor(c.value).run();
                                        setActiveMenu(null);
                                    }}
                                    className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-all shadow-sm ${activeColor === c.value ? 'border-seal' : 'border-paper-dark'}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Highlight Picker */}
                <div className="relative">
                    <button
                        onClick={() => setActiveMenu(activeMenu === 'highlight' ? null : 'highlight')}
                        className={`p-2 rounded transition-all flex flex-col items-center gap-0.5 border-2 ${activeMenu === 'highlight' ? 'bg-seal/20 border-seal shadow-inner' : (activeHighlight !== 'transparent' ? 'bg-seal border-seal text-paper shadow-inner' : 'bg-transparent border-transparent hover:bg-paper/10 text-paper')}`}
                        title="Vurgu Rengi"
                    >
                        <Highlighter size={18} />
                        <div
                            className="w-4 h-1 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.5)] border border-white/20"
                            style={{ backgroundColor: activeHighlight }}
                        />
                    </button>
                    {activeMenu === 'highlight' && (
                        <div className="absolute top-full left-0 mt-1 p-2 bg-paper border border-paper-dark shadow-xl rounded-md z-20 flex gap-2 animate-in fade-in duration-200">
                            {highlightingColors.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => {
                                        if (c.value === 'transparent') {
                                            editor.chain().focus().unsetHighlight().run();
                                        } else {
                                            editor.chain().focus().setHighlight({ color: c.value }).run();
                                        }
                                        setActiveMenu(null);
                                    }}
                                    className={`w-6 h-6 rounded border-2 hover:scale-110 transition-all shadow-sm relative overflow-hidden ${activeHighlight === c.value ? 'border-seal scale-110' : 'border-paper-dark'}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.name}
                                >
                                    {c.value === 'transparent' && <div className="absolute inset-0 bg-red-500 hover:bg-red-600 rotate-45 scale-x-150 h-px top-1/2" />}
                                </button>
                            ))}
                        </div>
                    )}
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
