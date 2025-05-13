import react from "react";
import { motion } from "framer-motion";
import { FaYarn } from "react-icons/fa";
import { TbBrandNpm } from "react-icons/tb";
import { SiBun, SiPnpm } from "react-icons/si";
import NpmModel from "../home/models/NpmModel";
import BunModel from "../home/models/BunModel";
import YarnModel from "../home/models/YarnModel";
import PnpmModel from "../home/models/PnpmModel";

var FromTopToBottom = {
  initial: { opacity: 0, y: -100 },
  exit: {
    opacity: 0,
    y: -50,
    transition: { duration: 0.3 },
  },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

export default function Introduction(): JSX.Element {
  var [_yarn, yarn_] = react.useState(false);
  var [_pnpm, pnpm_] = react.useState(false);
  var [_npm, npm_] = react.useState(false);
  var [_bun, bun_] = react.useState(false);
  var _yarn_ = () => yarn_(!_yarn);
  var _pnpm_ = () => pnpm_(!_pnpm);
  var _npm_ = () => npm_(!_npm);
  var _bun_ = () => bun_(!_bun);

  return (
    <react.Fragment>
      <motion.section className="flex items-center justify-center border-b-8 border-double border-[#cd322d6e] w-full pt-12 md:pt-24 lg:pt-32 bg-neutral-950 text-white">
        <div className="container space-y-10 xl:space-y-16 h-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <motion.h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-red-700" {...FromTopToBottom}>
                Yt-Dlx: The Ultimate Multimedia Downloader
              </motion.h1>
              <motion.p className="mx-auto max-w-[700px] text-white font-semibold md:text-xl" {...FromTopToBottom}>
                Yt-Dlx is a powerful and versatile tool that allows you to download audio and video content from a wide range of sources, including
                YouTube, Vimeo, and many more.
              </motion.p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={_npm_}
                className="inline-flex h-10 items-center justify-center rounded-3xl border hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50">
                <TbBrandNpm className="mr-2 h-5 w-5" />
                Install Using Npm
              </button>
              <button
                onClick={_yarn_}
                className="inline-flex h-10 items-center justify-center rounded-3xl border hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50">
                <FaYarn className="mr-2 h-5 w-5" />
                Install Using Yarn
              </button>
              <button
                onClick={_pnpm_}
                className="inline-flex h-10 items-center justify-center rounded-3xl border hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50">
                <SiPnpm className="mr-2 h-5 w-5" />
                Install Using Pnpm
              </button>
              <button
                onClick={_bun_}
                className="inline-flex h-10 items-center justify-center rounded-3xl border hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50">
                <SiBun className="mr-2 h-5 w-5" />
                Install Using Bun
              </button>
            </div>
          </div>
          <motion.img
            alt="logo"
            width={1200}
            height={300}
            src="/radio.gif"
            className="mx-auto aspect-[3/1] overflow-hidden rounded-t-2xl object-cover object-center border-t-4 border-r-4 border-l-4 border-[#cd322d6e] shadow-[0_0_400px_rgba(255,0,0,0.5)] shadow-red-700"
          />
        </div>
      </motion.section>
      {/* [ Modals ] */}
      <YarnModel open={_yarn} close={_yarn_} />
      <PnpmModel open={_pnpm} close={_pnpm_} />
      <NpmModel open={_npm} close={_npm_} />
      <BunModel open={_bun} close={_bun_} />
    </react.Fragment>
  );
}
