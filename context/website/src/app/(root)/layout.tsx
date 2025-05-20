// src/app/(root)/layout.tsx
import React from "react";
import Providers from "@/app/(root)/providers";
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return <Providers>{children}</Providers>;
}
