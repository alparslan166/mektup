"use client";

import React from "react";
import { Package } from "lucide-react";

interface GiftImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

export default function GiftImage({ src, alt, className }: GiftImageProps) {
    const [error, setError] = React.useState(false);

    if (!src || error) {
        return (
            <div className={className + " flex items-center justify-center"}>
                <Package size={32} className="opacity-40" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    );
}
