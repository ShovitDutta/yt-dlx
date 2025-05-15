"use client";
import React from "react";
import { motion } from "framer-motion";
import NavPackage from "@/components/nav";
import Introduction from "@/app/home/page";
import { MdComment } from "react-icons/md";
import FootPackage from "@/components/foot";
import { MdDescription } from "react-icons/md";
import { FaClipboardCheck } from "react-icons/fa";
import { BiLogoTypescript } from "react-icons/bi";
import { RiJavascriptFill } from "react-icons/ri";
const FromRightToLeft = { initial: { opacity: 0, x: 100 }, exit: { opacity: 0, x: 50, transition: { duration: 0.3 } }, whileInView: { opacity: 1, x: 0, transition: { duration: 0.8 } } };
const FromLeftToRight = { initial: { opacity: 0, x: -100 }, exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }, whileInView: { opacity: 1, x: 0, transition: { duration: 0.8 } } };
const AndBounce = { initial: { opacity: 0, y: -50 }, whileInView: { y: 0, opacity: 1, transition: { duration: 0.8, bounce: 0.3 } }, exit: { opacity: 0, y: -50, transition: { duration: 0.3 } } };
const FadeIn = { initial: { opacity: 0 }, whileInView: { opacity: 1, transition: { duration: 0.5 } } };
export default function MiscVideoComments() {
    return (
        <main className="flex flex-col overflow-x-hidden max-h-screen scrollbar-thin bg-black scrollbar-track-black scrollbar-thumb-red-700 font-sans">
            <NavPackage />
            <div className="w-full px-4 py-6 md:px-6">
                <Introduction />
            </div>
            <motion.section className="flex items-center justify-center w-full py-8 md:py-12 lg:py-16 bg-black text-white">
                <div className="container px-4 md:px-6 max-w-7xl">
                    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
                        <div className="flex flex-col justify-start space-y-6">
                            <motion.div className="inline-block rounded-full bg-red-700 text-white px-4 py-2 text-sm" {...FadeIn}>
                                Documentation
                            </motion.div>
                            <motion.h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl text-red-600" {...FromLeftToRight}>
                                YtDlx.Misc.Video.Comments()
                            </motion.h2>
                            <motion.p className="text-gray-300 text-lg" {...AndBounce}>
                                Fetches comments for a YouTube video based on a search query. This function searches for a video matching the query and retrieves its comments.
                            </motion.p>
                            <motion.div className="flex flex-wrap gap-3 mt-6" {...FadeIn}>
                                <button
                                    className="inline-flex h-10 items-center justify-center rounded-full bg-red-600 text-white font-medium px-5 py-2 text-sm transition-all hover:bg-red-700"
                                    onClick={() => {
                                        window.open("https://github.com/yt-dlx/yt-dlx/blob/main/config/examples/typescript/Misc/Video/comments.test.ts", "_blank");
                                    }}>
                                    <BiLogoTypescript className="mr-2 h-5 w-5" /> TypeScript Examples
                                </button>
                                <button
                                    className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-800 text-white font-medium hover:bg-neutral-700 px-5 py-2 text-sm transition-all"
                                    onClick={() => {
                                        window.open("https://github.com/yt-dlx/yt-dlx/blob/main/config/examples/javascript/Misc/Video/comments.test.js", "_blank");
                                    }}>
                                    <RiJavascriptFill className="mr-2 h-5 w-5 text-yellow-400" /> JavaScript Examples
                                </button>
                                <button
                                    className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-800 text-white font-medium hover:bg-neutral-700 px-5 py-2 text-sm transition-all"
                                    onClick={() => {
                                        window.open("https://github.com/yt-dlx/yt-dlx/blob/main/config/examples/ecmascript/Misc/Video/comments.test.mjs", "_blank");
                                    }}>
                                    <MdDescription className="mr-2 h-5 w-5 text-blue-400" /> EcmaScript Examples
                                </button>
                            </motion.div>
                        </div>
                        <motion.div
                            className="mx-auto aspect-video overflow-hidden rounded-lg w-full max-w-[550px] bg-neutral-900 border border-neutral-800 flex items-center justify-center"
                            {...FromRightToLeft}>
                            <div className="text-center p-6">
                                <MdComment className="w-24 h-24 text-red-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">Video Comments</h3>
                                <p className="text-neutral-400">Fetch comments for a YouTube video</p>
                            </div>
                        </motion.div>
                    </div>
                    <motion.div className="mt-8 w-full" {...AndBounce}>
                        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                            <h3 className="text-xl font-semibold text-red-500 mb-4">Parameters</h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="mt-1 mr-3 text-red-600 flex-shrink-0">
                                        <FaClipboardCheck className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-wrap w-full">
                                        <span className="font-semibold text-neutral-300">options</span>
                                        <p className="text-neutral-400 w-full">An object containing the configuration options.</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pl-7">
                                    <div className="flex items-start">
                                        <div className="mt-1 mr-3 text-red-600 flex-shrink-0">
                                            <FaClipboardCheck className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-wrap w-full">
                                            <span className="font-semibold text-neutral-300">options.query</span>
                                            <p className="text-neutral-400 w-full">
                                                The search query to find the video. Must be at least 2 characters long.
                                                <span className="text-red-500"> Required</span>.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="mt-1 mr-3 text-red-600 flex-shrink-0">
                                            <FaClipboardCheck className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-wrap w-full">
                                            <span className="font-semibold text-neutral-300">options.verbose</span>
                                            <p className="text-neutral-400 w-full">(Optional) Enable verbose logging.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800 mt-6">
                            <h3 className="text-xl font-semibold text-red-500 mb-4">Return Value</h3>
                            <div className="flex items-start">
                                <div className="mt-1 mr-3 text-red-600 flex-shrink-0">
                                    <FaClipboardCheck className="h-4 w-4" />
                                </div>
                                <div className="flex flex-wrap w-full">
                                    <p className="text-neutral-300 w-full">An EventEmitter instance for handling events during comment fetching.</p>
                                </div>
                            </div>
                            <div className="space-y-3 pl-7 mt-4">
                                <div className="flex items-start">
                                    <div className="mt-1 mr-3 text-red-600 flex-shrink-0">
                                        <FaClipboardCheck className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-wrap w-full">
                                        <span className="font-semibold text-purple-400">Emits &quot;data&quot;</span>
                                        <p className="text-neutral-400 w-full">On success: An array of comment objects.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="mt-1 mr-3 text-red-600 flex-shrink-0">
                                        <FaClipboardCheck className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-wrap w-full">
                                        <span className="font-semibold text-purple-400">Emits &quot;error&quot;</span>
                                        <p className="text-neutral-400 w-full">On failure (e.g., validation, no video/comments found): Error message.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
            <FootPackage />
        </main>
    );
}
