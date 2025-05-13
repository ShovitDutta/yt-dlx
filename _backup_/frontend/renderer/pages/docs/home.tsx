import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import NavPackage from "../components/nav";
import FootPackage from "../components/foot";
import Introduction from "../home/Introduction";
import { FaClipboardCheck } from "react-icons/fa";

const FromLeftToRight = {
  initial: { opacity: 0, x: -100 },
  exit: {
    opacity: 0,
    x: -50,
    transition: { duration: 0.3 },
  },
  whileInView: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8 },
  },
};
const FromRightToLeft = {
  initial: { opacity: 0, x: 100 },
  exit: {
    opacity: 0,
    x: 50,
    transition: { duration: 0.3 },
  },
  whileInView: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8 },
  },
};
const AndBounce = {
  initial: { opacity: 0, y: -50 },
  whileInView: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, bounce: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: { duration: 0.3 },
  },
};

export default function HomePage(): JSX.Element {
  return (
    <main className="flex flex-col overflow-x-hidden max-h-screen scrollbar-thin bg-neutral-950 scrollbar-track-neutral-950 scrollbar-thumb-red-700 font-semibold">
      <NavPackage />
      <Introduction />
      <motion.section className="flex items-center justify-center border-b-8 border-double border-[#cd322d6e] w-full py-8 md:py-16 lg:py-24 bg-black text-white">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <motion.div className="inline-block rounded-3xl bg-red-700 text-neutral-900 cursor-not-allowed font-black px-3 py-1 text-sm">
                Viewing Documentation For:
              </motion.div>
              <motion.h2 className="text-3xl font-black tracking-tighter sm:text-4xl lg:text-5xl text-red-700" {...FromLeftToRight}>
                Various API Functions
              </motion.h2>
              <motion.div className="overflow-x-auto" {...AndBounce}>
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-red-700 font-black uppercase">Function Name</th>
                      <th className="text-red-700 font-black uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <Link href="/docs/Audio/AudioCustom" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          AudioOnly.Single.Custom()
                        </Link>
                      </td>
                      <td className="italic">Downloads and processes a single YouTube video with audio customization options.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Audio/AudioHighest" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          AudioOnly.Single.Highest()
                        </Link>
                      </td>
                      <td className="italic">Downloads and processes the highest quality audio from a single YouTube video.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Audio/AudioLowest" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          AudioOnly.Single.Lowest()
                        </Link>
                      </td>
                      <td className="italic">Downloads and processes the lowest quality audio from a single YouTube video.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Video/VideoCustom" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          VideoOnly.Single.Custom()
                        </Link>
                      </td>
                      <td className="italic">Downloads a YouTube video with custom resolution and optional video filter.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Video/VideoHighest" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          VideoOnly.Single.Highest()
                        </Link>
                      </td>
                      <td className="italic">Downloads the highest quality version of a YouTube video with optional video filter.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Video/VideoLowest" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          VideoOnly.Single.Lowest()
                        </Link>
                      </td>
                      <td className="italic">Downloads the lowest quality version of a YouTube video with optional video filter.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link
                          href="/docs/AudioVideo/AudioVideoCustom"
                          className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          AudioVideo.Single.Custom()
                        </Link>
                      </td>
                      <td className="italic">
                        Downloads audio and video from a YouTube video URL with customizable options such as resolution and filters.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Link
                          href="/docs/AudioVideo/AudioVideoHighest"
                          className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          AudioVideo.Single.Highest()
                        </Link>
                      </td>
                      <td className="italic">Downloads audio and video from a YouTube video URL with the highest available resolution.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link
                          href="/docs/AudioVideo/AudioVideoLowest"
                          className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          AudioVideo.Single.Lowest()
                        </Link>
                      </td>
                      <td className="italic">Downloads audio and video from a YouTube video URL with the lowest available resolution.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Command/extract" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          info.extract()
                        </Link>
                      </td>
                      <td className="italic">Extracts metadata information from a YouTube video.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Command/list_formats" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          info.list_formats()
                        </Link>
                      </td>
                      <td className="italic">Lists the available formats and manifest information for a YouTube video.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Command/playlist_data" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          ytSearch.Playlist.Single()
                        </Link>
                      </td>
                      <td className="italic">Extracts metadata for videos in a YouTube playlist.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Command/search_playlist" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          ytSearch.Playlist.Multiple()
                        </Link>
                      </td>
                      <td className="italic">Searches for YouTube playlists based on the query.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Command/search_videos" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          ytSearch.Video.Multiple()
                        </Link>
                      </td>
                      <td className="italic">Searches for YouTube videos based on the query.</td>
                    </tr>
                    <tr>
                      <td>
                        <Link href="/docs/Command/video_data" className="font-bold flex items-center justify-center gap-2 hover:text-red-700">
                          <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" />
                          ytSearch.Video.Single()
                        </Link>
                      </td>
                      <td className="italic">Fetches data for a single YouTube video based on the video ID or link.</td>
                    </tr>
                  </tbody>
                </table>
              </motion.div>
            </div>
            <motion.img
              alt="logo"
              width={550}
              height={310}
              src="/Functions.gif"
              {...FromRightToLeft}
              className="mx-auto aspect-video overflow-hidden rounded-3xl object-cover object-center w-full max-w-[550px] border-4 border-[#cd322d6e] shadow-[0_0_400px_rgba(255,0,0,0.5)] shadow-red-700"
            />
          </div>
        </div>
      </motion.section>

      <FootPackage />
    </main>
  );
}
