"use client";
import React, { useEffect } from "react";
import { useVideoStore } from "@/store/videoStore";
export default function RootLayout({ children }: { children: React.ReactNode }) {
    const initializeSections = useVideoStore(state => state.initializeSections);

    useEffect(() => {
        // Trigger initial fetching of all content sections when the layout mounts
        initializeSections();
    }, [initializeSections]);

    return <>{children}</>;
}
