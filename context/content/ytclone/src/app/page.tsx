import { cookies } from "next/headers";

export default async function Page() {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    return (
        <div>
            <h1>All Cookies:</h1>
            <ul>
                {allCookies.map(cookie => (
                    <li key={cookie.name}>
                        <strong>{cookie.name}:</strong> {cookie.value}
                    </li>
                ))}
            </ul>
        </div>
    );
}
