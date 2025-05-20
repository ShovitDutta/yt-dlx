"use client";

import React, { useEffect } from "react";
import { useZustandStore, valtioStore } from "@/store/root";
import { useSnapshot } from "valtio";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const setZustandData = useZustandStore(state => state.setZustandData);
    const snapshot = useSnapshot(valtioStore);

    useEffect(() => {
        // Simulate data fetching
        const fetchData = async () => {
            const data = "Fetched data from layout";
            setZustandData(data);
            valtioStore.valtioData = data;
        };

        fetchData();
    }, [setZustandData]);

    return <>{children}</>;
}
