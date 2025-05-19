"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [hasCookiePermission, setHasCookiePermission] = useState(false);
  const [cookies, setCookies] = useState<string | null>(null);

  useEffect(() => {
    const checkCookiePermission = async () => {
      // This will only work if the user has already granted cookie permission
      try {
        document.cookie = 'testCookie=testValue; SameSite=None; Secure';
        setHasCookiePermission(true);
      } catch (error) {
        console.error("Failed to set cookie:", error);
        setHasCookiePermission(false);
      }
    };

    checkCookiePermission();
  }, []);

  useEffect(() => {
    if (hasCookiePermission) {
      setCookies(document.cookie);
    }
  }, [hasCookiePermission]);

  return (
    <div className="min-h-screen bg-gray-900 py-6 text-white">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">YouTube Clone</h1>
        {hasCookiePermission ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Cookies:</h2>
            <p className="text-gray-400">{cookies || "No cookies found."}</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-4">
              This website requires access to your YouTube cookies to display your Home Feed.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
              onClick={() => {
                // This will trigger the permission request again
                document.cookie = 'testCookie=testValue; SameSite=None; Secure';
                setHasCookiePermission(true);
              }}
            >
              Allow Cookies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
