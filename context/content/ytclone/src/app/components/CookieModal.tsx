"use client";
import { useState } from 'react';

interface CookieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCookiesSubmit: (cookies: string) => void;
}

const CookieModal: React.FC<CookieModalProps> = ({ isOpen, onClose, onCookiesSubmit }) => {
  const [cookies, setCookies] = useState('');

  const handleSubmit = () => {
    onCookiesSubmit(cookies);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-md shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-white">Enter YouTube Cookies</h2>
        <p className="text-gray-400 mb-4">
          To access your Home Feed, you need to provide your YouTube cookies. Please follow these steps:
        </p>
        <ol className="text-gray-400 list-decimal pl-5 mb-4">
          <li>Log in to YouTube in your browser (Chrome, Firefox, etc.).</li>
          <li>Open your browser's developer tools (usually by pressing F12 or right-clicking and selecting "Inspect").</li>
          <li>Go to the "Application" or "Storage" tab (the name may vary depending on your browser).</li>
          <li>In the "Storage" section, find the "Cookies" section and select "youtube.com".</li>
          <li>You will see a list of cookies. Find the cookies with the following names: <code>__Secure-1PSIDCC</code>, <code>ST-3opvp5</code>, <code>SID</code>, <code>__Secure-1PAPISID</code>, <code>SAPISID</code>, <code>SIDCC</code>, <code>__Secure-3PSID</code>, <code>__Secure-1PSIDTS</code>, <code>HSID</code>, <code>__Secure-1PSID</code>, <code>__Secure-3PAPISID</code>, <code>__Secure-ROLLOUT_TOKEN</code>, <code>PREF</code>, <code>SSID</code>, <code>VISITOR_PRIVACY_METADATA</code>, <code>APISID</code>, <code>__Secure-3PSIDTS</code>, <code>VISITOR_INFO1_LIVE</code>, <code>__Secure-3PSIDCC</code>, <code>LOGIN_INFO</code>, <code>YSC</code>, <code>GPS</code>.</li>
          <li>Copy the <span className="font-bold">values</span> of these cookies and paste them into the text area below, separated by semicolons (<code>;</code>) and spaces. For example: <code>cookie1=value1; cookie2=value2; cookie3=value3</code>.</li>
        </ol>
        <textarea
          className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={4}
          placeholder="Paste your cookies here"
          value={cookies}
          onChange={(e) => setCookies(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md mr-2 focus:outline-none focus:shadow-outline"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieModal;