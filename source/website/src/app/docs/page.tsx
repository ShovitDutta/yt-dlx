"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import Introduction from "../home/page";
import NavPackage from "@/components/nav";
import FootPackage from "@/components/foot";
import "react-tooltip/dist/react-tooltip.css";
import { FaClipboardCheck } from "react-icons/fa";
const FromLeftToRight = { initial: { opacity: 0, x: -100 }, exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }, whileInView: { opacity: 1, x: 0, transition: { duration: 0.8 } } };
const AndBounce = { initial: { opacity: 0, y: -50 }, whileInView: { y: 0, opacity: 1, transition: { duration: 0.8, bounce: 0.3 } }, exit: { opacity: 0, y: -50, transition: { duration: 0.3 } } };
interface Function {
  href: string;
  name: string;
  description: string;
  category: "Audio" | "Video" | "Audio_Video" | "Account" | "Search" | "Misc";
}
interface CategorizedFunctions {
  Audio?: Function[];
  Video?: Function[];
  Audio_Video?: Function[];
  Account?: Function[];
  Search?: Function[];
  Misc?: Function[];
}
const FunctionTable = ({ title, functions }: { title: string; functions: Function[] }) => (
  <motion.div className="w-full h-96 overflow-y-auto mb-8 bg-neutral-950 rounded-4xl border-4 border-double border-red-950 hover:border-red-900" {...AndBounce}>
    <h3 className="text-2xl font-black tracking-tighter sm:text-3xl text-red-700 mb-4 pt-6 underline text-center">{title}</h3>
    <table className="table mx-auto text-left">
      <thead>
        <tr>
          <th className="text-red-700 font-black uppercase">Function Name</th> <th className="text-red-700 font-black uppercase">Description</th>
        </tr>
      </thead>
      <tbody>
        {functions.map(func => (
          <tr key={func.href} className="hover:bg-red-700 hover:text-black">
            <td className="px-6">
              <Link
                href={func.href}
                data-tooltip-place="top"
                data-tooltip-id={`function-tooltip-${func.href.replace(/\//g, "-")}`}
                data-tooltip-content="Press to see examples"
                className="font-bold flex items-center gap-2 hover:text-black"
                data-tooltip-style='{ "backgroundColor": "#1f2937", "color": "#f4f4f5", "fontSize": "14px", "padding": "8px", "borderRadius": "4px", "border": "1px solid #cd322d" }'>
              <FaClipboardCheck className="mr-2 inline-block h-4 w-4" /> {func.name}
            </Link>
            <Tooltip id={`function-tooltip-${func.href.replace(/\//g, '-')}`} />
          </td>
          <td className="py-2 text-sm font-extralight hover:text-black">{func.description}</td>
        </tr>
        ))}
      </tbody>
    </table>
  </motion.div>
);
export default function HomePage() {
  const functions = [
    /* Audio Functions */
    {
      category: "Audio",
      href: "/docs/Audio/Custom",
      name: "YouTubeDLX.Audio.Custom()",
      description: "Downloads or streams audio from YouTube with customizable options for quality, filters, and output formats.",
    },
    {
      category: "Audio",
      href: "/docs/Audio/Lowest",
      name: "YouTubeDLX.Audio.Lowest()",
      description: "Downloads or streams the lowest quality audio from YouTube.",
    },
    {
      category: "Audio",
      href: "/docs/Audio/Highest",
      name: "YouTubeDLX.Audio.Highest()",
      description: "Downloads or streams the highest quality audio from YouTube.",
    } /* Video Functions */,
    {
      category: "Video",
      href: "/docs/Video/Custom",
      name: "YouTubeDLX.Video.Custom()",
      description: "Downloads or streams video from YouTube with custom options.",
    },
    {
      category: "Video",
      href: "/docs/Video/Highest",
      name: "YouTubeDLX.Video.Highest()",
      description: "Downloads or streams the highest quality video from YouTube.",
    },
    {
      category: "Video",
      href: "/docs/Video/Lowest",
      name: "YouTubeDLX.Video.Lowest()",
      description: "Downloads or streams the lowest quality video from YouTube.",
    } /* Audio_Video Functions */,
    {
      category: "Audio_Video",
      href: "/docs/Audio_Video/Custom",
      name: "YouTubeDLX.Audio_Video.Custom()",
      description: "Downloads or streams combined audio and video from YouTube with custom options.",
    },
    {
      category: "Audio_Video",
      href: "/docs/Audio_Video/Highest",
      name: "YouTubeDLX.Audio_Video.Highest()",
      description: "Downloads or streams the highest quality audio from YouTube with filter options.",
    },
    {
      category: "Audio_Video",
      href: "/docs/Audio_Video/Lowest",
      name: "YouTubeDLX.Audio_Video.Lowest()",
      description: "Downloads or streams the lowest quality audio and video from YouTube.",
    } /* Search Functions */,
    {
      category: "Search",
      href: "/docs/Search/Channel/Multiple",
      name: "YouTubeDLX.Search.Channel.Multiple()",
      description: "Searches for YouTube channels based on a query.",
    },
    {
      category: "Search",
      href: "/docs/Search/Channel/Single",
      name: "YouTubeDLX.Search.Channel.Single()",
      description: "Fetches data for a single YouTube channel. This function retrieves detailed information about a specific YouTube channel using its link or ID.",
    },
    {
      category: "Search",
      href: "/docs/Search/Playlist/Multiple",
      name: "YouTubeDLX.Search.Playlist.Multiple()",
      description: "placeholder_description",
    },
    {
      category: "Search",
      href: "/docs/Search/Playlist/Single",
      name: "YouTubeDLX.Search.Playlist.Single()",
      description: "placeholder_description",
    },
    {
      category: "Search",
      href: "/docs/Search/Video/Multiple",
      name: "YouTubeDLX.Search.Video.Multiple()",
      description: "placeholder_description",
    },
    {
      category: "Search",
      href: "/docs/Search/Video/Single",
      name: "YouTubeDLX.Search.Video.Single()",
      description: "placeholder_description",
    } /* Account Functions */,
    {
      category: "Account",
      href: "/docs/Account/History",
      name: "YouTubeDLX.Account.History()",
      description: "Fetches the watch history of a user.",
    },
    {
      category: "Account",
      href: "/docs/Account/HomeFeed",
      name: "YouTubeDLX.Account.HomeFeed()",
      description: "Fetches the home feed of a user.",
    },
    {
      category: "Account",
      href: "/docs/Account/SubscriptionsFeed",
      name: "YouTubeDLX.Account.SubscriptionsFeed()",
      description: "Fetches the subscriptions feed of a user.",
    },
    {
      category: "Account",
      href: "/docs/Account/UnseenNotifications",
      name: "YouTubeDLX.Account.UnseenNotifications()",
      description: "Fetches the count of unseen notifications for a user.",
    } /* Misc Functions */,
    {
      category: "Misc",
      href: "/docs/Misc/System/Help",
      name: "YouTubeDLX.Misc.System.Help()",
      description: "placeholder_description",
    },
    {
      category: "Misc",
      href: "/docs/Misc/Video/GetId",
      name: "YouTubeDLX.Misc.Video.GetId()",
      description: "placeholder_description",
    },
    {
      category: "Misc",
      href: "/docs/Misc/Video/Extract",
      name: "YouTubeDLX.Misc.Video.Extract()",
      description: "placeholder_description",
    },
    {
      category: "Misc",
      href: "/docs/Misc/Video/Formats",
      name: "YouTubeDLX.Misc.Video.Formats()",
      description: "placeholder_description",
    },
    {
      category: "Misc",
      href: "/docs/Misc/Video/Related",
      name: "YouTubeDLX.Misc.Video.Related()",
      description: "placeholder_description",
    },
    {
      category: "Misc",
      href: "/docs/Misc/Video/Comments",
      name: "YouTubeDLX.Misc.Video.Comments()",
      description: "placeholder_description",
    },
    {
      category: "Misc",
      href: "/docs/Misc/Video/Transcript",
      name: "YouTubeDLX.Misc.Video.Transcript()",
      description: "placeholder_description",
    },
  ] as {
    category: "Audio" | "Video" | "Audio_Video" | "Account" | "Search" | "Misc";
    href: string;
    name: string;
    description: string;
  }[];
  const categorizedFunctions: CategorizedFunctions = functions.reduce((acc, func) => {
    if (!acc[func.category]) acc[func.category] = [];
    (acc[func.category as keyof CategorizedFunctions] as Function[]).push(func);
    return acc;
  }, {} as CategorizedFunctions);
  return (
    <main className="flex flex-col items-center justify-start overflow-y-auto max-h-screen scrollbar-thin bg-neutral-950 scrollbar-track-neutral-950 scrollbar-thumb-red-700 font-semibold">
      <NavPackage />
      <div className="w-full">
        <Introduction />
      </div>
      <motion.section className="flex items-center justify-center border-b-8 border-double border-[#cd322d6e] w-full py-8 md:py-16 lg:py-24 bg-black text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-6 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4 text-center">
              <motion.h2 className="text-3xl font-black tracking-tighter sm:text-4xl lg:text-5xl text-red-700" {...FromLeftToRight}>
                Various API Functions
              </motion.h2>
              <motion.div className="inline-block rounded-3xl bg-red-700 text-neutral-900 cursor-not-allowed font-black px-3 py-1 text-sm"> Viewing Documentation For: </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center items-center">
                {categorizedFunctions.Audio && <FunctionTable title="Audio Functions" functions={categorizedFunctions.Audio} />}
                {categorizedFunctions.Video && <FunctionTable title="Video Functions" functions={categorizedFunctions.Video} />}
                {categorizedFunctions.Audio_Video && <FunctionTable title="Audio/Video Functions" functions={categorizedFunctions.Audio_Video} />}
                {categorizedFunctions.Search && <FunctionTable title="Search Functions" functions={categorizedFunctions.Search} />}
                {categorizedFunctions.Account && <FunctionTable title="Account Functions" functions={categorizedFunctions.Account} />}
                {categorizedFunctions.Misc && <FunctionTable title="Misc Functions" functions={categorizedFunctions.Misc} />}
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      <FootPackage />
    </main>
  );
}
