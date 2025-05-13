"use client";
import Link from "next/link";
import { SiBun } from "react-icons/si";
import { FaYarn } from "react-icons/fa";
import { SiPnpm } from "react-icons/si";
import { TbBrandNpm } from "react-icons/tb";
import { MdAudioFile } from "react-icons/md";
import { FaFileVideo } from "react-icons/fa6";
import NavPackage from "@/pages/components/nav";
import { SiFirefoxbrowser } from "react-icons/si";
import { AiFillCodeSandboxCircle } from "react-icons/ai";

export default function AwesomePackage() {
  // import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
  // const queryClient = useQueryClient;
  // const [fd, setfd] = useState({
  // AudioVideo: false,
  // VideoOnly: false,
  // AudioOnly: false,
  // Highest: false,
  // Lowest: false,
  // TubeQuery: "",
  // });
  // const { isPending, error, data } = useQuery({
  // queryKey: ["AudioOnly"],
  // queryFn: async  => {
  // const queryString = new URLSearchParams({
  // AudioVideo: fd.AudioVideo.toString,
  // TubeQuery: fd.TubeQuery,
  // VideoOnly: fd.VideoOnly.toString,
  // AudioOnly: fd.AudioOnly.toString,
  // Highest: fd.Highest.toString,
  // Lowest: fd.Lowest.toString,
  // }).toString;
  // const response = await fetch(
  // `/api/audio/single/highest?formdata=${queryString}`,
  // {
  // method: "GET",
  // }
  // );
  // if (response.status === 200) return Object.keys(await response.json);
  // },
  // });
  // const handleChange = (event: { target: any }) => {
  // const target = event.target;
  // const value = target.type === "checkbox" ? target.checked : target.value;
  // setfd((prevFormData) => ({
  // ...prevFormData,
  // [target.name]: value,
  // }));
  // };
  // const handleForm = (event: React.FormEvent<HTMLFormElement>) => {
  // event.preventDefault;
  // };

  return (
    <main className="overflow-x-hidden max-h-screen scrollbar-thin bg-[#1A1A1C] scrollbar-track-[#1A1A1C] scrollbar-thumb-red-600">
      <NavPackage />
      {/* ======================================================[ Introduction ]======================================================= */}
      <section className="flex flex-col items-center justify-center mt-20">
        <div className="max-w-screen-2xl px-6 py-16 mx-auto space-y-12">
          <article className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl text-red-600 font-bold lg:text-9xl">YT-DLX@8.1.1</h1>
            </div>
            <p className="text-white/80">
              Yt-Dlx Is A Robust Multimedia Downloading Tool Meticulously Crafted To Elevate Your Media Consumption Experience. With Its Advanced
              Capabilities, It Offers An All-Encompassing Solution For Effortlessly Acquiring Audio And Video Content From Diverse Sources. Drawing
              Inspiration From Renowned Projects Such As Python-Yt-Dlp And Python-Youtube-Dl, Yt-Dlx Combines Cutting-Edge Features With Real-Time
              Data Acquisition Facilitated By Puppeteer Technologies. Whether You Seek To Enrich Your Audio Library Or Curate A Collection Of
              High-Quality Videos, Yt-Dlx Stands As Your Indispensable Companion, Ensuring Seamless And Efficient Media Acquisition.
            </p>
          </article>
          <div>
            <div className="flex flex-wrap py-2 gap-2 border-b border-red-600 border-dashed">
              <div className="flex flex-col items-start justify-between w-full md:flex-row md:items-center text-white/80">
                <div className="flex items-center gap-2 md:space-x-2">
                  <TbBrandNpm className="text-red-600" size={50} />
                  <FaYarn className="text-red-600" size={30} />
                  <SiPnpm className="text-red-600" size={30} />
                  <SiBun className="text-red-600" size={30} />
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-8">
              <p className="text-2xl font-semibold text-red-600">Install Now Using Any Package Manager Of Your Choice!</p>
              <ul className="ml-4 space-y-1 list-disc text-white/80">
                <li>
                  <a rel="noopener noreferrer" className="cursor-pointer">
                    <span className="text-red-600">yarn</span> add yt-dlx | <span className="text-red-600">yarn</span> global add yt-dlx
                  </a>
                </li>
                <li>
                  <a rel="noopener noreferrer" className="cursor-pointer">
                    <span className="text-red-600">bun</span> add yt-dlx | <span className="text-red-600">bun</span> add -g yt-dlx
                  </a>
                </li>
                <li>
                  <a rel="noopener noreferrer" className="cursor-pointer">
                    <span className="text-red-600">npm</span> install yt-dlx | <span className="text-red-600">npm</span> install -g yt-dlx
                  </a>
                </li>
                <li>
                  <a rel="noopener noreferrer" className="cursor-pointer">
                    <span className="text-red-600">pnpm</span> install yt-dlx | <span className="text-red-600">pnpm</span> install -g yt-dlx
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* ======================================================[ PlayGround ]======================================================= */}
      {/* <section className="flex items-center justify-center">
        <div className="justify-center mx-auto text-left align-bottom transition-all transform bg-neutral-900 rounded-3xl max-w-screen-xl max-screen-w-4xl border-8 border-double border-red-600 shadow-red-600/60 shadow-2xl hover:shadow-red-600 duration-300">
          <div className="grid flex-wrap items-center justify-center grid-cols-1 mx-auto shadow-xl lg:grid-cols-2 rounded-3xl">
            <div className="w-full px-6 py-3">
              <div className="mt-3 text-left sm:mt-5">
                <div className="inline-flex items-center w-full">
                  <h3 className="text-lg font-bold text-red-600 leading-6 lg:text-5xl">
                    Yt-Dlx PlayGround
                    <span className="text-sm gap-2">(GUI mode)</span>
                  </h3>
                </div>
                <div className="mt-4 text-base text-red-600">
                  <p>
                    please make sure to read the documentation for proper usage.
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <form onSubmit={(event) => handleForm(event)}>
                  <div>
                    <label htmlFor="TubeQuery" className="sr-only">
                      YouTube Video-Id/Link/Name
                    </label>
                    <input
                      required
                      type="text"
                      id="TubeQuery"
                      name="TubeQuery"
                      value={fd.TubeQuery}
                      onChange={handleChange}
                      className="block w-full px-5 py-3 text-base text-red-600 placeholder-neutral-500 transition duration-600 ease-in-out transform border border-transparent rounded-lg bg-neutral-800 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-red-800 focus:ring-offset-2 focus:ring-offset-red-600"
                      placeholder="YouTube Video-Id/Link/Name"
                    />
                  </div>
                  <div className="flex space-x-2 items-center mt-2">
                    <input
                      type="checkbox"
                      name="AudioOnly"
                      onChange={handleChange}
                      className="checkbox checkbox-xs checkbox-error"
                    />
                    <label
                      htmlFor="AudioOnly"
                      className="text-red-600 font-bold text-sm lowercase"
                    >
                      Audio Only
                    </label>
                    <input
                      type="checkbox"
                      name="VideoOnly"
                      onChange={handleChange}
                      className="checkbox checkbox-xs checkbox-error"
                    />
                    <label
                      htmlFor="VideoOnly"
                      className="text-red-600 font-bold text-sm lowercase"
                    >
                      Video Only
                    </label>
                    <input
                      type="checkbox"
                      name="AudioVideo"
                      onChange={handleChange}
                      className="checkbox checkbox-xs checkbox-error"
                    />
                    <label
                      htmlFor="AudioVideo"
                      className="text-red-600 font-bold text-sm lowercase"
                    >
                      Audio & Video
                    </label>
                  </div>
                  <div className="flex space-x-2 items-center">
                    <input
                      type="checkbox"
                      name="Highest"
                      onChange={handleChange}
                      className="checkbox checkbox-xs checkbox-error"
                    />
                    <label
                      htmlFor="Highest"
                      className="text-red-600 font-bold text-sm lowercase"
                    >
                      Highest
                    </label>
                    <input
                      type="checkbox"
                      name="Lowest"
                      onChange={handleChange}
                      className="checkbox checkbox-xs checkbox-error"
                    />
                    <label
                      htmlFor="Lowest"
                      className="text-red-600 font-bold text-sm lowercase"
                    >
                      Lowest
                    </label>
                  </div>
                  <div className="mt-4">
                    <input
                      type="submit"
                      value="Submit"
                      className="py-2 px-6 bg-red-800 text-white rounded-md text-lg font-semibold hover:bg-red-600 shadow-red-600/20 shadow-2xl transition duration-300"
                    />
                  </div>
                </form>
              </div>
            </div>
            <div className="order-first hidden w-full lg:block">
              <img
                alt=""
                src="/yt-dlx.png"
                className="object-cover h-full bg-cover"
              />
            </div>
          </div>
        </div>
      </section> */}
      {/* ======================================================[ Documentation ]======================================================= */}
      <section className="flex flex-col items-center justify-center">
        <div className="max-w-screen-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="max-w-screen-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl text-red-600">Explore All Available Functions</h2>
            <p className="mt-4 text-white/80">
              YT-DLX accommodates various node.js coding flavours! <span className="text-red-600">(typescript), (commonjs) and (esm)</span>, ensuring
              100% compatibility and comprehensive type safety coverage.
            </p>
          </div>
          {/* ========================[ AUDIO ONLY ]======================== */}
          <div className="mt-8 grid grid-cols-1 gap-8 md:mt-16 hover:bg-red-950/10 border-4 border-red-600 border-double rounded-3xl shadow-red-600 duration-500 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="table text-white/80">
                <thead>
                  <tr>
                    <th className="text-red-600 text-lg">Function Category</th>
                    <th className="text-red-600 text-lg">Function Call</th>
                    <th className="text-red-600 text-lg">Brief Description</th>
                    <th className="text-red-600 text-lg">Usage & Examples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <MdAudioFile size={20} className="text-red-600 animate-pulse" />
                      Audio Only
                    </td>
                    <td>Audio.Single.Highest</td>
                    <td>Downloads and processes the highest quality audio from a single YouTube video.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/Audio/AudioHighest" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <MdAudioFile size={20} className="text-red-600 animate-pulse" />
                      Audio Only
                    </td>
                    <td>Audio.Single.Lowest</td>
                    <td>Downloads and processes the lowest quality audio from a single YouTube video.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/Audio/AudioLowest" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <MdAudioFile size={20} className="text-red-600 animate-pulse" />
                      Audio Only
                    </td>
                    <td>Audio.Single.Custom</td>
                    <td>Downloads and processes a single YouTube video with audio customization options.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/Audio/AudioCustom" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  {/* ========================[ VIDEO ONLY ]======================== */}
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <FaFileVideo size={18} className="text-red-600 animate-pulse" />
                      Video Only
                    </td>
                    <td>Video.Single.Highest</td>
                    <td>Downloads the highest quality version of a YouTube video with customization options.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/Video/VideoHighest" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <FaFileVideo size={18} className="text-red-600 animate-pulse" />
                      Video Only
                    </td>
                    <td>Video.Single.Lowest</td>
                    <td>Downloads the lowest quality version of a YouTube video with customization options.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/Video/VideoLowest" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <FaFileVideo size={18} className="text-red-600 animate-pulse" />
                      Video Only
                    </td>
                    <td>Video.Single.Custom</td>
                    <td>Downloads a YouTube video with customization options.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/Video/VideoCustom" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  {/* ========================[ AUDIO VIDEO ]======================== */}
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <AiFillCodeSandboxCircle size={20} className="text-red-600 animate-pulse" />
                      Audio Video
                    </td>
                    <td>AudioVideo.Single.Highest</td>
                    <td>Downloads audio and video from a YouTube video URL with the highest available resolution.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/AudioVideo/AudioVideoHighest" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <AiFillCodeSandboxCircle size={20} className="text-red-600 animate-pulse" />
                      Audio Video
                    </td>
                    <td>AudioVideo.Single.Lowest</td>
                    <td>Downloads audio and video from a YouTube video URL with the lowest available resolution.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/AudioVideo/AudioVideoLowest" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <AiFillCodeSandboxCircle size={20} className="text-red-600 animate-pulse" />
                      Audio Video
                    </td>
                    <td>AudioVideo.Single.Custom</td>
                    <td>Downloads audio and video from a YouTube video URL with customizable options.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/AudioVideo/AudioVideoCustom" className="font-bold">
                        click here!
                      </Link>
                    </td>
                  </tr>
                  {/* ========================[ YTSEARCH ]======================== */}
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <SiFirefoxbrowser size={20} className="text-red-600 animate-pulse" />
                      YouTube Search
                    </td>
                    <td>Video.Single</td>
                    <td>Fetches data for a single YouTube video based on the video ID or link.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/" className="font-bold">
                        docs coming soon!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <SiFirefoxbrowser size={20} className="text-red-600 animate-pulse" />
                      YouTube Search
                    </td>
                    <td>Video.Multiple</td>
                    <td>Searches for YouTube videos based on the query.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/" className="font-bold">
                        docs coming soon!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <SiFirefoxbrowser size={20} className="text-red-600 animate-pulse" />
                      YouTube Search
                    </td>
                    <td>Playlist.Single</td>
                    <td>Extracts metadata for videos in a YouTube playlist.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/" className="font-bold">
                        docs coming soon!
                      </Link>
                    </td>
                  </tr>
                  <tr className="hover:bg-red-600/20">
                    <td className="flex items-center justify-center gap-2">
                      <SiFirefoxbrowser size={20} className="text-red-600 animate-pulse" />
                      YouTube Search
                    </td>
                    <td>Playlist.Multiple</td>
                    <td>Searches for YouTube playlists based on the query.</td>
                    <td className="cursor-pointer hover:bg-red-800 hover:animate-pulse rounded-r-3xl text-white">
                      <Link href="/docs/" className="font-bold">
                        docs coming soon!
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      {/* ======================================================[ Footer ]======================================================= */}
      <footer className="pt-20 pb-6 flex flex-wrap items-baseline justify-center">
        <span className="text-[#e73d75] text-3xl mr-2">
          Mixly <span className="text-[#C4C4C4] text-lg">&</span> <span className="text-red-600">Yt-Dlx</span>
        </span>
        <span className="mt-2 text-sm font-light text-[#C4C4C4]">Copyright © 2023</span>
      </footer>
    </main>
  );
}
