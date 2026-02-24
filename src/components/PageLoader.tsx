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
    useEffect(() => {
        if (!isLoading) return;

        const now = Date.now();
        const elapsed = now - startTime;
        const remaining = Math.max(0, 1000 - elapsed);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, remaining);

        return () => clearTimeout(timer);
    }, [pathname, searchParams, setIsLoading, startTime, isLoading]);

    // Handle global click events on internal links
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (link &&
                link.href &&
                link.href.startsWith(window.location.origin) &&
                !link.hasAttribute("download") &&
                link.target !== "_blank") {

                const currentPath = window.location.pathname;
                const targetPath = new URL(link.href).pathname;

                if (currentPath !== targetPath) {
                    setStartTime(Date.now());
                    setIsLoading(true);
                }
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
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
                    <div className="relative w-32 h-32 md:w-48 md:h-48">
                        {/* Background / Empty version (Dimmed/Gray) */}
                        <img
                            src={loaderImage}
                            alt="Loading Background"
                            className="w-full h-full object-contain opacity-20 grayscale"
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
                            />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PageLoader;
