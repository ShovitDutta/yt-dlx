import React from "react";
import { useEffect } from "react";
import { mainStore } from "../../store";
export default function RootLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/Trending");
                const data = await response.json();
                mainStore.getState().setData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);
    return <>{children}</>;
}
