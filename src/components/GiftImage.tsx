"use client";

import React, { useState } from "react";
import { Package } from "lucide-react";
import Image from "next/image";

interface GiftImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

export default function GiftImage({ src, alt, className }: GiftImageProps) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={className + " flex items-center justify-center bg-slate-100/50"}>
                <Package size={32} className="opacity-40" />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                onError={() => setError(true)}
            />
        </div>
    );
}
