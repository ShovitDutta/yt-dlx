import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaBook } from "react-icons/fa";
import NavPackage from "./components/nav";
import FootPackage from "./components/foot";
import Introduction from "./home/Introduction";
import { FaClipboardCheck } from "react-icons/fa";
import { HiFolderDownload } from "react-icons/hi";
import { RiContactsBookFill } from "react-icons/ri";
import { TbHelpHexagonFilled } from "react-icons/tb";
const FromRightToLeft = { initial: { opacity: 0, x: 100 }, exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }, whileInView: { opacity: 1, x: 0, transition: { duration: 0.4 } } };
const FromLeftToRight = { initial: { opacity: 0, x: -100 }, exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }, whileInView: { opacity: 1, x: 0, transition: { duration: 0.4 } } };
export default function HomePage() {
    return (
        <main className="flex flex-col overflow-y-auto overflow-x-hidden max-h-screen bg-neutral-950 font-semibold">
            <NavPackage />
            <div className="w-full">
                <Introduction />
            </div>
            {/* ======================/ Playground /====================== */}
            <section className="flex items-center justify-center border-b-8 border-double border-[#cd322d6e] w-full py-12 md:py-24 lg:py-32 bg-black text-white">
                <div className="container px-4 md:px-6">
                    <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <div className="inline-block rounded-3xl bg-red-700 text-neutral-900 cursor-not-allowed font-black px-3 py-1 text-sm">Playground</div>
                                <h2 className="text-3xl font-black tracking-tighter sm:text-7xl text-red-700">Powerful Multimedia Downloading Playground</h2>
                                <p className="max-w-[600px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    YT-DLX allows you to download audio and video content from a wide range of sources, including YouTube, Vimeo, and many more. With its advanced capabilities, you can
                                    customize the download format, resolution, and more.
                                </p>
                            </div>
                            <ul className="grid gap-2 py-4">
                                <li>
                                    <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" /> Download audio and video from diverse sources
                                </li>
                                <li>
                                    <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" /> Customize download format, resolution, and more
                                </li>
                                <li>
                                    <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" /> Supports a wide range of media formats
                                </li>
                                <li>
                                    <FaClipboardCheck className="mr-2 inline-block h-4 w-4 text-red-700" /> Seamless integration with Node.js and other environments
                                </li>
                            </ul>
                            <Link
                                href="/gui/home"
                                className="inline-flex h-10 items-center justify-center rounded-3xl border hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50">
                                <HiFolderDownload className="mr-2 h-5 w-5" /> Try YT-DLX in Graphical User Interface mode
                            </Link>
                        </div>
                        <motion.img
                            alt="logo"
                            width={550}
                            height={310}
                            src="/YouTube_Circle.gif"
                            {...FromRightToLeft}
                            className="mx-auto aspect-video overflow-hidden rounded-3xl object-cover object-center sm:w-full border-4 border-[#cd322d6e] shadow-[0_0_400px_rgba(255,0,0,0.5)] shadow-red-700"
                        />
                    </div>
                </div>
            </section>
            {/* =====================/ Documentation /===================== */}
            <section className="flex items-center justify-center border-b-8 border-double border-[#cd322d6e] w-full py-12 md:py-24 lg:py-32 bg-black text-white">
                <div className="container px-4 md:px-6">
                    <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
                        <motion.img
                            alt="logo"
                            width={550}
                            height={310}
                            src="/YouTube_Music.gif"
                            {...FromLeftToRight}
                            className="mx-auto aspect-video overflow-hidden rounded-3xl object-cover object-center sm:w-full border-4 border-[#cd322d6e] shadow-[0_0_400px_rgba(255,0,0,0.5)] shadow-red-700"
                        />
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <div className="inline-block rounded-3xl bg-red-700 text-neutral-900 cursor-not-allowed font-black px-3 py-1 text-sm">Documentation</div>
                                <h2 className="text-3xl font-black tracking-tighter sm:text-7xl text-red-700">Comprehensive Guides</h2>
                                <p className="max-w-[600px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Our extensive documentation provides detailed guides and tutorials to help you get the most out of YT-DLX. Whether you're a beginner or an advanced user, you'll
                                    find everything you need to know about installation, usage, and more.
                                </p>
                            </div>
                            <ul className="grid gap-2 py-4">
                                <li>
                                    <RiContactsBookFill className="mr-2 inline-block h-4 w-4 text-red-700" /> Detailed installation instructions
                                </li>
                                <li>
                                    <RiContactsBookFill className="mr-2 inline-block h-4 w-4 text-red-700" /> Usage examples and best practices
                                </li>
                                <li>
                                    <RiContactsBookFill className="mr-2 inline-block h-4 w-4 text-red-700" /> API reference and advanced configurations
                                </li>
                                <li>
                                    <RiContactsBookFill className="mr-2 inline-block h-4 w-4 text-red-700" /> Troubleshooting and FAQs
                                </li>
                            </ul>
                            <Link
                                href="/docs/home"
                                className="inline-flex h-10 items-center justify-center rounded-3xl border hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50">
                                <FaBook className="mr-2 h-5 w-5" /> Checkout Usage Documentations for YT-DLX
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            {/* ========================/ Support /======================== */}
            <section className="flex items-center justify-center border-b-8 border-double border-[#cd322d6e] w-full py-12 md:py-24 lg:py-32 bg-black text-white">
                <div className="container px-4 md:px-6">
                    <div className="grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <div className="inline-block rounded-3xl bg-red-700 text-neutral-900 cursor-not-allowed font-black px-3 py-1 text-sm">Support</div>
                                <h2 className="text-3xl font-black tracking-tighter sm:text-7xl text-red-700">We're Here to Help</h2>
                                <p className="max-w-[600px] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    If you have any questions or need assistance, our support team is here to help. We provide comprehensive support to ensure you have the best experience with YT-DLX.
                                </p>
                            </div>
                            <ul className="grid gap-2 py-4">
                                <li>
                                    <TbHelpHexagonFilled className="mr-2 inline-block h-4 w-4 text-red-700" /> 24/7 customer support
                                </li>
                                <li>
                                    <TbHelpHexagonFilled className="mr-2 inline-block h-4 w-4 text-red-700" /> Community forums and knowledge base
                                </li>
                                <li>
                                    <TbHelpHexagonFilled className="mr-2 inline-block h-4 w-4 text-red-700" /> Regular updates and improvements
                                </li>
                                <li>
                                    <TbHelpHexagonFilled className="mr-2 inline-block h-4 w-4 text-red-700" /> Contact us via email or live chat
                                </li>
                            </ul>
                            <button className="inline-flex h-10 items-center justify-center rounded-3xl border hover:border-neutral-900 text-red-700 font-black border-red-700/50 bg-neutral-900 hover:bg-red-700 hover:text-neutral-900 px-8 text-sm duration-700 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50">
                                <TbHelpHexagonFilled className="mr-2 h-5 w-5" /> Create an Issue in Here
                            </button>
                        </div>
                        <motion.img
                            alt="logo"
                            width={550}
                            height={310}
                            src="/YouTube_Support.gif"
                            {...FromRightToLeft}
                            className="mx-auto aspect-video overflow-hidden rounded-3xl object-cover object-center sm:w-full border-4 border-[#cd322d6e] shadow-[0_0_400px_rgba(255,0,0,0.5)] shadow-red-700"
                        />
                    </div>
                </div>
            </section>
            <FootPackage />
        </main>
    );
}
