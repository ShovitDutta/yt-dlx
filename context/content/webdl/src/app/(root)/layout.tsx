"use client";
import React, { useEffect } from "react";
import { useVideoStore } from "../../../store/root-page";
export default function RootLayout({ children }: { children: React.ReactNode }) {
    const initializeSections = useVideoStore(state => state.initializeSections);
    useEffect(() => {
        initializeSections();
    }, [initializeSections]);
    return <>{children}</>;
}
