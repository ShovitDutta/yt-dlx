"use client";
import { CookiesProvider } from "react-cookie";
interface ProvidersProps {
    children: React.ReactNode;
}
function Providers({ children }: ProvidersProps) {
    return <CookiesProvider>{children}</CookiesProvider>;
}
export default Providers;
