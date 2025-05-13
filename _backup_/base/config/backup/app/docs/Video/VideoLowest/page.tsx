"use client";
import { SiBun } from "react-icons/si";
import { FaYarn } from "react-icons/fa";
import { SiPnpm } from "react-icons/si";
import React, { useState } from "react";
import { TbBrandNpm } from "react-icons/tb";
import NavPackage from "@/pages/components/nav";
import { motion, AnimatePresence } from "framer-motion";
import SyntaxHighlighter from "react-syntax-highlighter";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const dbAcc = [
  {
    title: "TypeScript Usage & Examples",
    content: (
      <SyntaxHighlighter language="typescript" style={gruvboxDark}>
        {`// =============================[ USING YT-DLX'S DOWNLOAD MACHANISM ]=============================
//
import ytdlx from "yt-dlx";
import colors from "colors";
(async () => {
  try {
    await ytdlx.VideoOnly.Single.Lowest({
      stream: false,
      verbose: true,
      onionTor: false,
      output: "public/video",
      query: "video-id/name/url",
    });
  } catch (error: any) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO SAVE THE FILE ]=============================
//
import * as fs from "fs";
(async () => {
  try {
    const result = await ytdlx.VideoOnly.Single.Lowest({
      stream: true,
      verbose: true,
      onionTor: false,
      output: "public/video",
      query: "video-id/name/url",
    });
    if (result && result.filename && result.ffmpeg) {
      result.ffmpeg.pipe(fs.createWriteStream(result.filename), {
        end: true,
      });
    } else {
      console.error(colors.red("@error:"), "ffmpeg or filename not found!");
    }
  } catch (error: any) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO PIPE THE FILE ]=============================
//
import express from "express";
(async () => {
  try {
    const server = express();
    server.get("/video/:query", async (req, res) => {
      try {
        const queryParam = req.params.query;
        const result = await ytdlx.VideoOnly.Single.Lowest({
          stream: true,
          verbose: true,
          onionTor: false,
          query: queryParam,
        });
        if (result && result.filename && result.ffmpeg) {
          result.ffmpeg.pipe(res, { end: true });
        } else res.status(404).send("ffmpeg or filename not found!");
      } catch (error: any) {
        res.status(500).send(error.message);
      }
    });
    server.listen(3000, () => {
      console.log(colors.blue("@server:"), "running on port 3000");
    });
  } catch (error: any) {
    console.error(colors.red(error.message));
  }
})();
//
// ========================================================================================
`}
      </SyntaxHighlighter>
    ),
  },
  {
    title: "ECMAScript Usage & Examples",
    content: (
      <SyntaxHighlighter language="javascript" style={gruvboxDark}>
        {`// =============================[ USING YT-DLX'S DOWNLOAD MACHANISM ]=============================
//
import ytdlx from "yt-dlx";
import colors from "colors";
(async () => {
  try {
    await ytdlx.default.VideoOnly.Single.Lowest({
      stream: false,
      verbose: true,
      onionTor: false,
      output: "public/video",
      query: "video-id/name/url",
    });
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO SAVE THE FILE ]=============================
//
import * as fs from "fs";
(async () => {
  try {
    const result = await ytdlx.default.VideoOnly.Single.Lowest({
      stream: true,
      verbose: true,
      onionTor: false,
      output: "public/video",
      query: "video-id/name/url",
    });
    if (result && result.filename && result.ffmpeg) {
      result.ffmpeg.pipe(fs.createWriteStream(result.filename), {
        end: true,
      });
    } else {
      console.error(colors.red("@error:"), "ffmpeg or filename not found!");
    }
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO PIPE THE FILE ]=============================
//
import express from "express";
(async () => {
  try {
    const server = express();
    server.get("/video/:query", async (req, res) => {
      try {
        const queryParam = req.params.query;
        const result = await ytdlx.default.VideoOnly.Single.Lowest({
          stream: true,
          verbose: true,
          onionTor: false,
          query: queryParam,
        });
        if (result && result.filename && result.ffmpeg) {
          result.ffmpeg.pipe(res, { end: true });
        } else res.status(404).send("ffmpeg or filename not found!");
      } catch (error) {
        res.status(500).send(error.message);
      }
    });
    server.listen(3000, () => {
      console.log(colors.blue("@server:"), "running on port 3000");
    });
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// ========================================================================================
`}
      </SyntaxHighlighter>
    ),
  },
  {
    title: "CommonJs Usage & Examples",
    content: (
      <SyntaxHighlighter language="javascript" style={gruvboxDark}>
        {`// =============================[ USING YT-DLX'S DOWNLOAD MACHANISM ]=============================
//
const ytdlx = require("yt-dlx");
const colors = require("colors");
(async () => {
  try {
    await ytdlx.default.VideoOnly.Single.Lowest({
      stream: false,
      verbose: true,
      onionTor: false,
      output: "public/video",
      query: "video-id/name/url",
    });
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO SAVE THE FILE ]=============================
//
const fs = require("fs");
(async () => {
  try {
    const result = await ytdlx.default.VideoOnly.Single.Lowest({
      stream: true,
      verbose: true,
      onionTor: false,
      output: "public/video",
      query: "video-id/name/url",
    });
    if (result && result.filename && result.ffmpeg) {
      result.ffmpeg.pipe(fs.createWriteStream(result.filename), {
        end: true,
      });
    } else {
      console.error(colors.red("@error:"), "ffmpeg or filename not found!");
    }
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// =============================[ USING STREAMING TO PIPE THE FILE ]=============================
//
const express = require("express");
(async () => {
  try {
    const server = express();
    server.get("/video/:query", async (req, res) => {
      try {
        const queryParam = req.params.query;
        const result = await ytdlx.default.VideoOnly.Single.Lowest({
          stream: true,
          verbose: true,
          onionTor: false,
          query: queryParam,
        });
        if (result && result.filename && result.ffmpeg) {
          result.ffmpeg.pipe(res, { end: true });
        } else res.status(404).send("ffmpeg or filename not found!");
      } catch (error) {
        res.status(500).send(error.message);
      }
    });
    server.listen(3000, () => {
      console.log(colors.blue("@server:"), "running on port 3000");
    });
  } catch (error) {
    console.error(colors.red(error.message));
  }
})();
//
// ========================================================================================
`}
      </SyntaxHighlighter>
    ),
  },
];

export default function AwesomePackage({ param }: any) {
  const [set, isSet] = useState<number | null>(null);
  const handleSet = (index: number) => {
    isSet(prev => (prev === index ? null : index));
  };

  return (
    <main className="overflow-x-hidden max-h-screen scrollbar-thin bg-[#1A1A1C] scrollbar-track-[#1A1A1C] scrollbar-thumb-red-600">
      <NavPackage />
      <section className="flex flex-col items-center justify-center mt-20">
        <div className="max-w-screen-2xl px-6 py-16 mx-auto space-y-12">
          <article className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl text-red-600 font-bold lg:text-9xl">YT-DLX@8.1.1</h1>
            </div>
            <p className="text-white/80">
              Uncover an unparalleled solution for effortless audio and video downloads powered by YT-DLX - An advanced{" "}
              <span className="text-red-600">(command-line + Node.js + Streaming)</span> tool meticulously designed for avid enthusiasts. YT-DLX
              stands out as a feature-rich advanced package built upon the foundation of{" "}
              <span className="text-red-600">(Youtube-DL & Python yt-dlx)</span>, consistently evolving with state-of-the-art functionalities.
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
              <p className="text-2xl font-semibold text-red-600">Install now using any package manager of your choice!</p>
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
      <section className="flex flex-col items-center justify-center">
        <div className="max-w-screen-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="max-w-screen-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl text-red-600">Viewing YtDlx.VideoOnly.Single.Lowest()</h2>
            <p className="mt-4 text-white/80">
              yt-dlx accommodates various node.js coding flavours! <span className="text-red-600">(typescript), (commonjs),</span> and{" "}
              <span className="text-red-600">(esm)</span>, ensuring 100% compatibility and comprehensive type safety coverage.
            </p>
            <ul className="list-disc m-4 bg-neutral-800/40 shadow-black shadow-2xl p-8 rounded-3xl border border-dashed border-red-600">
              <li>Downloads the lowest quality version of a YouTube video with optional video filter.</li>
              <li>@param query - The YouTube video URL or ID or name.</li>
              <li>@param stream - (optional) Whether to return the FfmpegCommand instead of downloading the video.</li>
              <li>@param verbose - (optional) Whether to log verbose output or not.</li>
              <li>@param output - (optional) The output directory for the processed files.</li>
              <li>
                @param filter - (optional) The video filter to apply. Available options: invert, rotate90, rotate270, grayscale, rotate180,
                flipVertical, flipHorizontal.
              </li>
              <li>@param onionTor - (optional) Whether to use Tor for the download or not.</li>
              <li>
                @returns A Promise that resolves when the video has been processed, unless `stream` is `true`, in which case it resolves with an
                object containing the `ffmpeg` command and the `filename`.
              </li>
            </ul>
            <AnimatePresence>
              {dbAcc.map((item, index) => (
                <motion.div
                  key={index}
                  transition={{ duration: 0.3 }}
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`text-sm font-mono shadow-black shadow-2xl hover:shadow-red-600/20 collapse ${
                    set === index ? "bg-[#272727]" : "bg-neutral-800/40"
                  } border border-red-600/10 rounded-3x mb-0.5 hover:border-red-600 hover:border-dashed`}>
                  <input type="radio" checked={set === index} onChange={() => handleSet(index)} />
                  <div
                    onClick={() => handleSet(index)}
                    className="collapse-title text-xl flex items-center justify-center cursor-pointer hover:text-red-600">
                    {item.title}
                  </div>
                  <div className={`collapse-content ${set === index ? "open" : "hidden"}`}>
                    <div className="font-bold text-xs">{item.content}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
      <footer className="pt-20 pb-6 flex flex-wrap items-baseline justify-center">
        <span className="text-[#e73d75] text-3xl mr-2">
          Mixly <span className="text-[#C4C4C4] text-lg">&</span> <span className="text-red-600">Yt-Dlx</span>
        </span>
        <span className="mt-2 text-sm font-light text-[#C4C4C4]">Copyright © 2023</span>
      </footer>
    </main>
  );
}
