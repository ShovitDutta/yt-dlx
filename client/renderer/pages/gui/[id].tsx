import react from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import NavPackage from "../components/nav";
import AudioOnly from "./models/AudioOnly";
import VideoOnly from "./models/VideoOnly";
import { AiFillAudio } from "react-icons/ai";
import FootPackage from "../components/foot";
import AudioVideo from "./models/AudioVideo";
import { IoVideocam } from "react-icons/io5";
import Introduction from "../home/Introduction";
import { PiTelevisionFill } from "react-icons/pi";

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

export default function VideoId(): JSX.Element {
 const router = useRouter();
 const { id } = router.query;
 const [ShowAudio, setShowAudio] = react.useState(false);
 const [ShowVideo, setShowVideo] = react.useState(false);
 const [TubeSearch, setTubeSearch] = react.useState<any>(null);
 const [ShowAudioVideo, setShowAudioVideo] = react.useState(false);
 const ToggleAudioVideo = () => setShowAudioVideo(!ShowAudioVideo);
 const ToggleAudio = () => setShowAudio(!ShowAudio);
 const ToggleVideo = () => setShowVideo(!ShowVideo);

 react.useEffect(() => {
  if (typeof id === "string" && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
   window.ipc.send("search", { videoId: id });
  } else {
   try {
    window.history.back();
   } catch {
    router.push("/home");
   }
  }
 }, [id]);

 react.useEffect(() => {
  if (typeof id === "string") {
   window.ipc.on("search", (response: string) => setTubeSearch(response));
  }
 }, [id]);

 return (
  <main className="overflow-x-hidden max-h-screen scrollbar-thin bg-neutral-950 scrollbar-track-neutral-950 scrollbar-thumb-red-600">
   <NavPackage />
   <Introduction />
   <react.Fragment>
    {TubeSearch ? (
     <section className="flex flex-col items-center justify-center">
      <div className="max-w-screen-2xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
       <section className="flex flex-col items-center justify-center">
        <div className="mt-8 grid grid-cols-1 gap-8 md:mt-16 bg-neutral-950 border-4 border-[#cd322d6e] rounded-3xl shadow-red-600 shadow-[0_0_80px_rgba(255,0,0,0.5)]">
         <div className="overflow-x-auto">
          <section className="max-w-screen-2xl px-6 mx-auto p-1">
           <motion.img
            alt="logo"
            width={550}
            height={310}
            {...FromRightToLeft}
            src={TubeSearch.thumbnails[TubeSearch.thumbnails.length - 1].url}
            className="object-cover w-full h-80 mt-4 rounded-t-3xl md:h-80 border-b-4 border-[#cd322d6e] shadow-red-600 shadow-2xl"
           />
           <div className="flex mt-1 flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
            <button
             onClick={() => {
              // window.ipc.send("formats", { query: id })
              ToggleAudio();
             }}
             className="inline-flex w-[500px] h-[50px] items-center justify-center rounded-b-3xl text-white font-semibold lowercase bg-neutral-900 hover:bg-red-600 border border-red-900 hover:border-neutral-900 hover:text-neutral-900 hover:font-bold shadow-red-600 shadow-2xl text-sm duration-700 transition-transform hover:scale-95">
             <AiFillAudio className="mr-2 h-6 w-6" /> Download Audio only
            </button>
            <button
             onClick={() => {
              // window.ipc.send("formats", { query: id })
              ToggleVideo();
             }}
             className="inline-flex w-[500px] h-[50px] items-center justify-center rounded-b-3xl text-white font-semibold lowercase bg-neutral-900 hover:bg-red-600 border border-red-900 hover:border-neutral-900 hover:text-neutral-900 hover:font-bold shadow-red-600 shadow-2xl text-sm duration-700 transition-transform hover:scale-95">
             <IoVideocam className="mr-2 h-6 w-6" /> Download Video only
            </button>
            <button
             onClick={() => {
              // window.ipc.send("formats", { query: id })
              ToggleAudioVideo();
             }}
             className="inline-flex w-[500px] h-[50px] items-center justify-center rounded-b-3xl text-white font-semibold lowercase bg-neutral-900 hover:bg-red-600 border border-red-900 hover:border-neutral-900 hover:text-neutral-900 hover:font-bold shadow-red-600 shadow-2xl text-sm duration-700 transition-transform hover:scale-95">
             <PiTelevisionFill className="mr-2 h-6 w-6" /> Download Audio + Video
            </button>
           </div>
           <motion.h2 className="text-6xl font-black text-red-600" {...FromBottomToTop}>
            {TubeSearch.title}
           </motion.h2>
           <p className="mt-8 leading-loose text-white font-semibold lowercase text-sm">
            <span className="text-red-600 font-black text-lg">@description: </span>
            {TubeSearch.description}
           </p>
           <ul className="text-white font-semibold p-1 mb-4 text-sm">
            <li>
             <span className="text-red-600 font-black text-lg">@videoId:</span> {TubeSearch.id}
            </li>
            <li>
             <span className="text-red-600 font-black text-lg">@channelid:</span> {TubeSearch.channelid}
            </li>
            <li>
             <span className="text-red-600 font-black text-lg">@channelname:</span> {TubeSearch.channelname}
            </li>
            <li>
             <span className="text-red-600 font-black text-lg">@duration:</span> {TubeSearch.duration}
            </li>
            <li>
             <span className="text-red-600 font-black text-lg">@uploadDate:</span> {TubeSearch.uploadDate}
            </li>
            <li>
             <span className="text-red-600 font-black text-lg">@viewCount:</span> {TubeSearch.viewCount}
            </li>
           </ul>
          </section>
         </div>
        </div>
       </section>
      </div>
      {/* [ Modals ] */}
      <AudioOnly isOpen={ShowAudio} onClose={ToggleAudio} videoId={TubeSearch.id} />
      <VideoOnly isOpen={ShowVideo} onClose={ToggleVideo} videoId={TubeSearch.id} />
      <AudioVideo isOpen={ShowAudioVideo} onClose={ToggleAudioVideo} videoId={TubeSearch.id} />
     </section>
    ) : (
     <section className="flex flex-col items-center justify-center w-full mt-10">
      <div className="flex flex-col items-center justify-center gap-4 w-96">
       <div className="skeleton bg-red-600 border-4 border-neutral-800/60 h-40 w-full shadow-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]"></div>
       <div className="skeleton bg-red-600 border-4 border-neutral-800/60 h-10 w-28 shadow-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]"></div>
       <div className="skeleton bg-red-600 border-4 border-neutral-800/60 h-10 w-full shadow-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]"></div>
       <div className="skeleton bg-red-600 border-4 border-neutral-800/60 h-10 w-full shadow-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]"></div>
      </div>
     </section>
    )}
   </react.Fragment>
   <FootPackage />
  </main>
 );
}
