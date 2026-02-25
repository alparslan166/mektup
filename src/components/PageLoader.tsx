"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/store/uiStore";
import { usePathname, useSearchParams } from "next/navigation";

const PageLoader = () => {
    const { isLoading, setIsLoading } = useUIStore();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [startTime, setStartTime] = useState(0);

    const loaderImage = `/images/kus-logo.png`;

    // Reset loading state when route changes, but with a minimum delay
    // Only auto-hide if the loader was triggered by a route change (which sets startTime)
    useEffect(() => {
        if (!isLoading) {
            setStartTime(0);
            return;
        }

        if (startTime === 0) return; // Manual loading, don't auto-hide

        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(0, 1000 - elapsed);

        const timer = setTimeout(() => {
            setIsLoading(false);
            setStartTime(0);
        }, remaining);

        return () => clearTimeout(timer);
    }, [pathname, searchParams, setIsLoading, startTime, isLoading]);

    // Handle global click events on internal links with optimization
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            // Optimized: only check if clicking an element or its parent is an anchor
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (!link || !link.href) return;

            // Only intercept internal links that aren't downloads or external targets
            const isInternal = link.href.startsWith(window.location.origin);
            const isDownload = link.hasAttribute("download");
            const isNewTab = link.target === "_blank";

            if (isInternal && !isDownload && !isNewTab) {
                const currentPath = window.location.pathname;
                const url = new URL(link.href);
                const targetPath = url.pathname;

                if (currentPath !== targetPath) {
                    // Start loader for navigation
                    setStartTime(Date.now());
                    setIsLoading(true);
                }
            }
        };

        document.addEventListener("click", handleClick, { capture: true });
        return () => document.removeEventListener("click", handleClick, { capture: true });
    }, [setIsLoading]);

    // Simple progress animation simulation when loading
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) return 100;
                    return prev + 10;
                });
            }, 100);
        } else {
            setProgress(0);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1c1917]/80 backdrop-blur-sm"
                >
                    <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                        {/* Background / Empty version (Dimmed/Gray) */}
                        <img
                            src={loaderImage}
                            alt="Loading Background"
                            className="w-full h-full object-contain opacity-20 grayscale"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '0';
                            }}
                        />

                        {/* Filling Version (Colored/Full) using clip-path */}
                        <motion.div
                            className="absolute inset-0 w-full h-full"
                            initial={{ clipPath: "inset(100% 0 0 0)" }}
                            animate={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}
                            transition={{ ease: "linear", duration: 0.1 }}
                        >
                            <img
                                src={loaderImage}
                                alt="Loading..."
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.opacity = '0';
                                }}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PageLoader;
