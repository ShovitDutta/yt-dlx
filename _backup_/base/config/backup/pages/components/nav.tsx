"use client";
import Link from "next/link";
import { RiHome5Fill } from "react-icons/ri";

export default function NavPackage() {
  return (
    <nav className="navbar bg-red-800/10 shadow-red-800/20 shadow-2xl text-gray-400 backdrop-blur-md fixed z-50 top-0 flex justify-between items-center px-4">
      <div className="flex items-baseline">
        <Link href="/" className="text-red-600 cursor-pointer text-4xl font-bold flex items-center gap-2">
          <RiHome5Fill size={30} className="hover:scale-125 duration-300 hover:animate-pulse" /> yt-dlx
        </Link>
      </div>
    </nav>
  );
}
