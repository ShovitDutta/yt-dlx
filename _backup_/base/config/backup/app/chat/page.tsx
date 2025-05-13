"use client";
import Link from "next/link";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import * as socketIO from "socket.io-client";
import { MdNearbyError } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { MdCreateNewFolder, MdJoinRight } from "react-icons/md";

export default function Mixly() {
  const { push } = useRouter();
  const [newRoom, setRoomName] = useState<string>("");
  const [joinRoom, setJoinRoom] = useState<string>("");
  const [newError, setNewError] = useState<string>("");
  const [joinError, setJoinError] = useState<string>("");
  const [socket, setSocket] = useState<socketIO.Socket>();
  const [isRooming, setIsRooming] = useState<boolean>(false);

  useEffect(() => {
    fetch("/ioSocket").finally(() => {
      let ioSocket = io();
      const handleCrErr = (data: any) => {
        setIsRooming(false);
        setNewError(data);
      };
      const handleJrErr = (data: any) => {
        setIsRooming(false);
        setJoinError(data);
      };
      const handleInside = (data: any) => {
        setIsRooming(false);
        push("/chat/" + data);
      };
      ioSocket.on("room[crErr]", handleCrErr);
      ioSocket.on("room[jrErr]", handleJrErr);
      ioSocket.on("room[inside]", handleInside);
      setSocket(ioSocket);
      return () => {
        ioSocket.off("room[crErr]", handleCrErr);
        ioSocket.off("room[jrErr]", handleJrErr);
        ioSocket.off("room[inside]", handleInside);
        ioSocket.disconnect();
      };
    });
  }, [push]);

  const reqCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRooming(true);
    socket?.emit("room[init]", {
      rQuery: newRoom,
      User: socket.id,
    });
  };

  const reqJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRooming(true);
    socket?.emit("room[join]", {
      rQuery: joinRoom,
      User: socket.id,
    });
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
          <div className="relative items-center w-full px-5 py-12 mx-auto md:px-12 lg:px-16 lg:py-24">
            <div className="flex w-full mx-auto text-left">
              <div className="relative inline-flex items-center mx-auto align-middle mt-8">
                <div className="text-center">
                  <span className="text-2xl xl:text-3xl text-orange-50/80">where the beats never stop</span>
                  <br />
                  <h1 className="uppercase tracking-widest font-extrabold text-[85px] xl:text-9xl text-[#e73d75]">Mixly</h1>
                  <p className="max-w-6xl mx-auto text-sm leading-relaxed text-orange-50/80">
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
              onSubmit={reqCreateRoom}
              className="flex flex-col py-4 gap-2 mx-auto max-w-4xl mt-8 bg-[#100E0D] p-4 rounded-3xl border border-[#e73d75]/30 hover:border-[#e73d75] hover:border-dashed shadow-xl shadow-black">
              <span className="text-[#e73d75] text-2xl">#Create-Your-Groove🚀</span>
              <p className="text-orange-50/80">
                Elevate your vibe: Craft a personalized room for music magic with your favorite crew. Unleash unforgettable moments in harmony!
              </p>
              <ul className="text-[#e73d75] list-decimal ml-4">
                <li>enter room name if you don&apos;t have a room</li>
                <li>press create new room button</li>
                <li>wait for the verification of room</li>
              </ul>
              <label className="form-control w-full max-w-6xl">
                <input
                  required
                  type="text"
                  value={newRoom}
                  disabled={isRooming}
                  placeholder="new room name"
                  onChange={e => setRoomName(e.target.value.toLowerCase())}
                  className="input w-full bg-neutral-800/20 rounded-full shadow-xl shadow-black/20 border border-neutral-700 hover:border-[#e73d75] hover:bg-[#100E0D]"
                />
              </label>
              <button
                type="submit"
                className={`${
                  isRooming
                    ? "loading loading-dots text-[#e73d75] ml-4 animate-bounce"
                    : "flex items-center btn bg-[#e73d75]/50 w-full rounded-3xl font-thin text-lg text-orange-100 hover:text-orange-50 hover:bg-[#e73d75] mt-2"
                }`}>
                <MdCreateNewFolder size={20} /> Create New Room
              </button>
              {newError && (
                <span className="flex items-center gap-2 text-red-700 rounded-lg justify-center">
                  <MdNearbyError size={20} className="animate-bounce" /> {newError}
                </span>
              )}
            </form>
            <form
              onSubmit={reqJoinRoom}
              className="flex flex-col py-4 gap-2 mx-auto max-w-4xl mt-8 bg-[#100E0D] p-4 rounded-3xl border border-[#e73d75]/30 hover:border-[#e73d75] hover:border-dashed shadow-xl shadow-black">
              <span className="text-[#e73d75] text-2xl">#Join-The-Beats🔊</span>
              <p className="text-orange-50/80">
                Immerse yourself in instant musical camaraderie! Jump into a curated room, groove with your favorite crew, and share sonic bliss
                together in a pre-made room.
              </p>
              <ul className="text-[#e73d75] list-decimal ml-4">
                <li>enter old room name if you have already created</li>
                <li>press join a room button</li>
                <li>wait for the verification of room</li>
              </ul>
              <label className="form-control w-full max-w-6xl">
                <input
                  required
                  type="text"
                  value={joinRoom}
                  placeholder="joinning room name"
                  onChange={e => setJoinRoom(e.target.value.toLowerCase())}
                  className="input bg-neutral-800/20 rounded-full shadow-xl shadow-black/20 border border-neutral-700 hover:border-[#e73d75] hover:bg-[#100E0D]"
                />
              </label>
              <button
                type="submit"
                className={`${
                  isRooming
                    ? "loading loading-dots text-[#e73d75] ml-4 animate-bounce"
                    : "flex items-center btn bg-[#e73d75]/50 w-full rounded-3xl font-thin text-lg text-orange-100 hover:text-orange-50 hover:bg-[#e73d75] mt-2"
                }`}>
                <MdJoinRight size={25} /> Join a Room
              </button>
              {joinError && (
                <span className="flex items-center gap-2 text-red-700 rounded-lg justify-center">
                  <MdNearbyError size={20} className="animate-bounce" /> {joinError}
                </span>
              )}
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
