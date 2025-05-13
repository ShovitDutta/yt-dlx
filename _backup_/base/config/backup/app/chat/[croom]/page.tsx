"use client";
import Link from "next/link";
import io from "socket.io-client";
import { MdSend } from "react-icons/md";
import { useEffect, useState } from "react";
import * as socketIO from "socket.io-client";
import { useParams, useRouter } from "next/navigation";

export default function Mixly() {
  const { push } = useRouter();
  const { croom }: any = useParams();
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<socketIO.Socket>();
  const [newMessage, setNewMessage] = useState<string>("");
  useEffect(() => {
    fetch("/ioSocket").finally(() => {
      let ioSocket = io();
      const handleJoinError = () => {
        push("/chat");
      };
      const handleCreateError = () => {
        push("/chat");
      };
      const handleMsgResp = (data: any) => {
        setMessages(prev => [...prev, data]);
      };
      ioSocket.emit("room[join]", {
        rQuery: croom,
        User: ioSocket.id,
      });
      ioSocket.on("room[crErr]", handleCreateError);
      ioSocket.on("room[jrErr]", handleJoinError);
      ioSocket.on("msg[Resp]", handleMsgResp);
      setSocket(ioSocket);
      return () => {
        ioSocket.off("room[crErr]", handleCreateError);
        ioSocket.off("room[jrErr]", handleJoinError);
        ioSocket.off("msg[Resp]", handleMsgResp);
        ioSocket.disconnect();
      };
    });
  }, [push, croom]);

  const reqMessages = (e: any) => {
    e.preventDefault();
    socket?.emit("msg[Req]", {
      text: newMessage,
      user: socket.id,
      room: croom,
    });
    setNewMessage("");
  };

  return (
    <main className="overflow-x-hidden max-h-screen scrollbar-thin bg-[#18181b] scrollbar-track-[#18181b] scrollbar-thumb-[#e73d75]">
      <nav className="navbar py-4 fixed top-0 z-50 bg-[#100E0D]/40 backdrop-blur-lg w-full border-b border-[#e73d75]/20 shadow-2xl shadow-black">
        <Link href="/" className="text-6xl text-[#e73d75] font-thin px-4 cursor-pointer">
          Mixly
        </Link>
      </nav>
      <section className="p-4 md:p-10 lg:p-20 xl:p-20 mt-28">
        <div className="mockup-window rounded-3xl shadow-xl shadow-black border border-[#e73d75]/20 bg-neutral-950/80">
          <div className="relative items-center w-full px-5 py-4 mx-auto md:px-12 lg:px-16 lg:py-24">
            <div className="flex w-full mx-auto text-left">
              <div className="relative inline-flex items-center mx-auto align-middle mt-8">
                <div className="text-center">
                  <span className="text-2xl xl:text-3xl text-cyan-50/80">where the beats never stop</span>
                  <br />
                  <h1 className="uppercase tracking-widest font-extrabold text-[85px] xl:text-9xl text-[#e73d75]">Mixly</h1>
                  <p className="max-w-6xl mx-auto text-sm leading-relaxed text-cyan-50/80">
                    Discover the limitless rhythm of Mixly: your go-to platform for free, unlimited streaming and downloading of music and videos.
                    Immerse yourself in a diverse collection of tunes, from classics to the latest hits. Elevate your experience by syncing playlists
                    and playing music together with multiple listeners. Mixly is not just a service; it&apos;s a shared symphony of sound. Enjoy the
                    freedom to explore, connect, and create unforgettable moments—all at your fingertips. Mixly, where the beat never stops, and the
                    experience is always in tune with your passion for music and videos.
                  </p>
                </div>
              </div>
            </div>
            <form
              onSubmit={reqMessages}
              className="flex flex-col items-center py-4 justify-center gap-2 mx-auto max-w-4xl mt-8 bg-[#100E0D] p-4 rounded-3xl border border-[#e73d75]/30 hover:border-[#e73d75] hover:border-dashed shadow-xl shadow-black">
              <span className="text-[#e73d75] text-2xl">#CollabMode📢</span>
              {messages.map((i: any, index: number) => (
                <ul key={index} className="list-disc">
                  <li>
                    {socket?.id === i.user ? "You" : "Them"}: {i.text}
                  </li>
                </ul>
              ))}
              <div className="flex flex-col w-full max-w-6xl gap-2">
                <div className="flex items-center">
                  <span className="text-cyan-100 mr-2">You:</span>
                  <input
                    required
                    type="text"
                    value={newMessage}
                    placeholder="Type your message..."
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 input bg-neutral-800/20 rounded-full shadow-xl shadow-black/20 border border-neutral-700 hover:border-[#e73d75] hover:bg-[#100E0D] text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center btn bg-[#e73d75]/50 w-full rounded-3xl font-thin text-lg text-cyan-100 hover:text-cyan-50 hover:bg-[#e73d75]">
                  <MdSend size={20} /> Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <footer className="py-8">
        <h1 className="sr-only">Footer</h1>
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-16">
          <div className="flex flex-wrap items-baseline justify-center">
            <span className="text-[#e73d75] text-3xl mr-2">Mixly</span>
            <span className="mt-2 text-xl font-light text-gray-500">Copyright © 2023</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
