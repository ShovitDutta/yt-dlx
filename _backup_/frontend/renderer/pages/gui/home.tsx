// ============================================================================/ with-websocket /============================================================================
//
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiFire } from "react-icons/hi";
import NavPackage from "../components/nav";
import FootPackage from "../components/foot";
import { TbWorldSearch } from "react-icons/tb";
import Introduction from "../home/Introduction";
import { TbDiamondFilled } from "react-icons/tb";
import { SiGradleplaypublisher } from "react-icons/si";

export default function HomeGUI(): JSX.Element {
  const [Query, setQuery] = React.useState<string>("");
  const [TubeSearch, setTubeSearch] = React.useState<any>(null);
  const FromBottomToTop = {
    initial: { opacity: 0, y: 100 },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.3 },
    },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  React.useEffect(() => {
    window.ipc.on("SearchVideos", (response: { data: Object[] }) => setTubeSearch(response.data));
  }, []);

  return (
    <main className="flex flex-col overflow-x-hidden max-h-screen scrollbar-thin bg-neutral-950 scrollbar-track-neutral-950 scrollbar-thumb-red-700 font-semibold">
      <NavPackage />
      <Introduction />
      <motion.section className="flex items-center justify-center border-b-8 border-double border-[#cd322d6e] w-full py-12 md:py-24 lg:py-32 bg-black text-white">
        <div className="container px-4 md:px-6">
          <form
            onSubmit={event => {
              setTubeSearch(null);
              event.preventDefault();
              window.ipc.send("SearchVideos", { query: Query });
            }}
            className="bg-neutral-950 max-w-screen-2xl p-10 text-red-700 mx-auto my-8 rounded-3xl border-4 border-[#cd322d6e] shadow-[0_0_400px_rgba(255,0,0,0.5)] shadow-red-700">
            <motion.h1 className="text-7xl mb-4 font-black" {...FromBottomToTop}>
              Yt-Dlx PlayGround
            </motion.h1>
            <motion.h2 className="text-3xl font-black text-red-700 mb-4" {...FromBottomToTop}>
              Effortless Audio Video Downloader And Streamer!
            </motion.h2>
            <motion.p className="mb-8 italic text-white font-semibold" {...FromBottomToTop}>
              Unlock the power of YT-DLX, the ultimate node.js toolkit for seamless audio and video downloading and streaming. Effortlessly handle
              various coding flavors, from TypeScript to CommonJS and ESM, ensuring 100% compatibility and comprehensive type safety.
            </motion.p>
            <div className="flex items-center gap-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="flex flex-row items-center justify-center label-text text-red-700 text-sm font-black">
                    <HiFire size={20} className="text-red-700 animate-pulse" />
                    option:
                    <span className="text-white font-semibold italic ml-2">provide video name</span>
                  </span>
                  <span className="flex flex-row items-center justify-center label-text-alt text-red-700 text-sm font-black">
                    <HiFire size={20} className="text-red-700 animate-pulse" />
                    option:
                    <span className="text-white font-semibold italic ml-2">provide video link</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={Query}
                  placeholder="required"
                  onChange={e => setQuery(e.target.value)}
                  className="input input-bordered w-full rounded-3xl bg-neutral-800"
                />
                <div className="label">
                  <span className="flex flex-row items-center justify-center label-text-alt text-red-700 text-sm font-black">
                    <HiFire size={20} className="text-red-700 animate-pulse" />
                    option:
                    <span className="text-white font-semibold italic ml-2">provide video id</span>
                  </span>
                </div>
              </label>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="flex flex-row items-center justify-center whitespace-nowrap text-sm font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:ring-2 active:ring-red-500 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-3xl shadow-md transition-all duration-300 hover:shadow-lg w-full">
                <TbWorldSearch size={20} className="mr-1 font-black" />
                Search YouTube
              </button>
            </div>
            {TubeSearch && (
              <React.Fragment>
                <section className="w-full mx-auto p-6">
                  <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {TubeSearch &&
                      TubeSearch.map((item: any, index: number) => (
                        <Link
                          key={index}
                          href={`/gui/${item.id}`}
                          className="relative group mb-4 duration-700 bg-[#111111] p-1 shadow-red-700 hover:shadow-[0_0_400px_rgba(255,0,0,0.5)] rounded-3xl border-2 border-red-700/40 hover:border-red-700 flex flex-col justify-between">
                          <div className="relative">
                            <img
                              alt="logo"
                              width={400}
                              height={400}
                              loading="lazy"
                              src={item.thumbnails[0].url}
                              className="object-cover w-full h-56 mb-5 bg-center rounded-t-2xl duration-700 group-hover:shadow-red-700 shadow-red-700/40 shadow-[0_0_20px_rgba(255,0,0,0.5)] group-hover:blur-sm"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                              <SiGradleplaypublisher className="text-red-700 animate-spin" size={140} />
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col p-2">
                            <p className="mb-2 text-xs font-semibold tracking-wider text-red-700 uppercase">number :: {index}</p>
                            <motion.h2 className="mb-2 text-xl font-black leading-snug text-red-700" {...FromBottomToTop}>
                              {item.title}
                            </motion.h2>
                            <p className="mb-4 text-sm font-normal text-white">{item.description}</p>
                            <div className="flex items-center text-white">
                              <ul className="mb-3 list-disc ml-4 text-xs">
                                <li>
                                  <span className="text-red-700 text-sm">videoId:</span> {item.id}
                                </li>
                                <li>
                                  <span className="text-red-700 text-sm">channelid:</span> {item.channelid}
                                </li>
                                <li>
                                  <span className="text-red-700 text-sm">channelname:</span> {item.channelname}
                                </li>
                                <li>
                                  <span className="text-red-700 text-sm">duration:</span> {item.duration}
                                </li>
                                <li>
                                  <span className="text-red-700 text-sm">uploadDate:</span> {item.uploadDate}
                                </li>
                                <li>
                                  <span className="text-red-700 text-sm">viewCount:</span> {item.viewCount}
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div className="flex items-center justify-center p-2 duration-700 group-hover:bg-red-700/60 bg-red-700/40 text-white/90 mt-0.5 w-full text-sm gap-1 rounded-b-xl">
                            powered by <TbDiamondFilled size={20} /> yt-dlx{" "}
                          </div>
                        </Link>
                      ))}
                  </div>
                </section>
              </React.Fragment>
            )}
          </form>
        </div>
      </motion.section>
      <FootPackage />
    </main>
  );
}
//
// ============================================================================/ with-websocket /============================================================================
