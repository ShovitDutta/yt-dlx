import Link from "next/link";
import { RiHome5Fill } from "react-icons/ri";
import { IoCaretBackOutline } from "react-icons/io5";
import { IoCaretForwardOutline } from "react-icons/io5";

export default function NavPackage() {
  return (
    <nav className="navbar bg-red-800/10 border-b border-red-700 shadow-red-800/20 shadow-2xl text-white/60 backdrop-blur-lg fixed z-50 top-0 flex justify-between items-center px-6 py-6">
      <Link
        href="/home"
        className="text-red-700 cursor-pointer text-4xl font-black flex items-center gap-2 hover:scale-105 duration-500 hover:animate-pulse">
        <RiHome5Fill size={30} />
        Yt-Dlx <span className="text-sm">Copyright © 2024</span>
      </Link>
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="text-red-700 cursor-pointer flex items-center hover:scale-105 duration-500 hover:animate-pulse">
          <IoCaretBackOutline size={40} />
        </button>
        <button
          onClick={() => window.history.forward()}
          className="text-red-700 cursor-pointer flex items-center hover:scale-105 duration-500 hover:animate-pulse">
          <IoCaretForwardOutline size={40} />
        </button>
      </div>
    </nav>
  );
}
