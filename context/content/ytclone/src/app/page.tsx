"use client";
import { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';

export default function Home() {
  const [cookies, setCookie] = useCookies(['__Secure-1PSIDCC', 'ST-3opvp5', 'SID', '__Secure-1PAPISID', 'SAPISID', 'SIDCC', '__Secure-3PSID', '__Secure-1PSIDTS', 'HSID', '__Secure-1PSID', '__Secure-3PAPISID', '__Secure-ROLLOUT_TOKEN', 'PREF', 'SSID', 'VISITOR_PRIVACY_METADATA', 'APISID', '__Secure-3PSIDTS', 'VISITOR_INFO1_LIVE', '__Secure-3PSIDCC', 'LOGIN_INFO', 'YSC', 'GPS']);

  return (
    <div className="min-h-screen bg-gray-900 py-6 text-white">
      <div className="container mx-auto px-4">
        <h1>Cookies</h1>
        <p>{JSON.stringify(cookies)}</p>
      </div>
    </div>
  );
}
