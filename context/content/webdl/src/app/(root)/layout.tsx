import { mainStore } from "../../store";
import React from "react";
import { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/Trending");
                const data = await response.json();
                mainStore.setData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return <>{children}</>;
}
