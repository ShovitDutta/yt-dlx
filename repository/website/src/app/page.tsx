"use client";
import { socket } from "@/socket";
import React, { useEffect, useState } from "react";
import { FaHome, FaCompass, FaBookOpen, FaSearch, FaBell, FaUserCircle, FaCog } from "react-icons/fa";
function Sidebar({ isConnected, transport }: { isConnected: boolean; transport: string }) {
    return (
        <aside className="w-64 bg-black/40 backdrop-blur-lg p-6 flex flex-col fixed top-0 left-0 h-screen border-r border-white/10 shadow-lg">
            <div className="flex items-center mb-8">
                <img src="/YouTube_Music.gif" alt="YouTube Music Logo" className="h-8 mr-2" />
                <span className="text-xl font-bold bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent">Music</span>
            </div>
            <nav className="flex-grow">
                <ul>
                    <li className="mb-4">
                        <a href="#" className="flex items-center text-gray-300 hover:text-white transition">
                            <FaHome className="mr-4 text-xl" /> Home
                        </a>
                    </li>
                    <li className="mb-4">
                        <a href="#" className="flex items-center text-gray-300 hover:text-white transition">
                            <FaCompass className="mr-4 text-xl" /> Explore
                        </a>
                    </li>
                    <li className="mb-4">
                        <a href="#" className="flex items-center text-gray-300 hover:text-white transition">
                            <FaBookOpen className="mr-4 text-xl" /> Library
                        </a>
                    </li>
                </ul>
            </nav>
            <div className="mt-auto">
                <button className="w-full py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white mb-4 transition">Sign in</button>
                <p className="text-gray-400 text-sm mb-4">Sign in to create & share playlists, get personalized recommendations, and more.</p>
                <div className="text-sm text-gray-400">
                    <p>
                        Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>{isConnected ? "connected" : "disconnected"}</span>
                    </p>
                    <p>
                        Transport: <span className="text-green-500">{transport}</span>
                    </p>
                </div>
            </div>
        </aside>
    );
}
function HeaderSearch({ videoUrl, setVideoUrl, handleSearch }: { videoUrl: string; setVideoUrl: (url: string) => void; handleSearch: () => void }) {
    return (
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border-b border-white/10 shadow-md">
            <div className="relative flex-1 mr-8">
                <input
                    type="text"
                    placeholder="Enter YouTube video URL"
                    className="w-full bg-black/60 text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-700 placeholder:text-gray-400"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button className="py-2 px-4 bg-red-900 hover:bg-red-800 rounded-md text-white font-semibold text-sm transition" onClick={handleSearch}>
                Extract Info
            </button>
            <div className="flex items-center space-x-4 text-white text-xl ml-4">
                <FaBell className="cursor-pointer hover:text-gray-300" /> <FaUserCircle className="cursor-pointer hover:text-gray-300" /> <FaCog className="cursor-pointer hover:text-gray-300" />
                <button className="py-2 px-4 bg-white text-black rounded-md font-semibold text-sm">Sign in</button>
            </div>
        </header>
    );
}
function CategoryButtons() {
    return (
        <div className="my-12">
            <div className="flex flex-wrap gap-4">
                {["Podcasts", "Relax", "Sleep", "Feel good", "Romance", "Energise", "Sad", "Party", "Commute", "Work out", "Focus"].map(category => (
                    <button key={category} className="px-4 py-2 bg-red-900 hover:bg-red-800 rounded-full text-sm text-white transition">
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
function QuickPicksSection() {
    const [quickPicksData, setQuickPicksData] = useState<any[]>([]);
    const [quickPicksLoading, setQuickPicksLoading] = useState(true);
    useEffect(() => {
        if (socket.connected) fetchQuickPicks();
        function fetchQuickPicks() {
            setQuickPicksLoading(true);
            socket.emit("yt-dlx-command", { command: "Search.Video.Multiple", options: { query: "popular music videos", orderBy: "viewCount", verbose: true } });
        }
        function onQuickPicksResponse(data: any) {
            console.log("Received Quick Picks response:", data);
            if (data.status === "success") setQuickPicksData(data.data);
            else setQuickPicksData([]);
            setQuickPicksLoading(false);
        }
        function onQuickPicksProgress(data: any) {
            console.log("Received Quick Picks progress:", data);
        }
        socket.on("connect", fetchQuickPicks);
        socket.on("Search.Video.Multiple-response", onQuickPicksResponse);
        socket.on("Search.Video.Multiple-progress", onQuickPicksProgress);
        return () => {
            socket.off("connect", fetchQuickPicks);
            socket.off("Search.Video.Multiple-response", onQuickPicksResponse);
            socket.off("Search.Video.Multiple-progress", onQuickPicksProgress);
        };
    }, [socket.connected]);
    return (
        <section className="my-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">Quick picks</h2>
                <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 border border-red-700 rounded-full text-sm hover:bg-red-900 transition">Play all</button>
                    <button className="p-2 bg-red-900 rounded-full hover:bg-red-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="p-2 bg-red-900 rounded-full hover:bg-red-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            {quickPicksLoading ? (
                <p>Loading Quick Picks...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {quickPicksData.length > 0 ? (
                        quickPicksData.map((video, index) => (
                            <div key={video.id || index} className="flex items-center bg-black/40 backdrop-blur-lg rounded-md overflow-hidden shadow-md">
                                <img src={video.thumbnails?.[0]?.url || "/placeholder-album.jpg"} alt="Album Art" className="w-16 h-16 object-cover" />
                                <div className="p-3">
                                    <p className="text-sm font-semibold">{video.title}</p> <p className="text-xs text-gray-400">{video.channelname}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No Quick Picks found.</p>
                    )}
                </div>
            )}
        </section>
    );
}
function BandBaajaBaraatSection() {
    const [trendingVideosData, setTrendingVideosData] = useState<any[]>([]);
    const [trendingLoading, setTrendingLoading] = useState(true);
    useEffect(() => {
        if (socket.connected) fetchTrendingVideos();
        function fetchTrendingVideos() {
            setTrendingLoading(true);
            socket.emit("yt-dlx-command", { command: "Search.Video.Multiple", options: { query: "trending music videos", orderBy: "viewCount", verbose: true } });
        }
        function onTrendingResponse(data: any) {
            console.log("Received Trending Videos response:", data);
            if (data.status === "success") setTrendingVideosData(data.data);
            else setTrendingVideosData([]);
            setTrendingLoading(false);
        }
        function onTrendingProgress(data: any) {
            console.log("Received Trending Videos progress:", data);
        }
        socket.on("connect", fetchTrendingVideos);
        socket.on("Search.Video.Multiple-response", onTrendingResponse);
        socket.on("Search.Video.Multiple-progress", onTrendingProgress);
        return () => {
            socket.off("connect", fetchTrendingVideos);
            socket.off("Search.Video.Multiple-response", onTrendingResponse);
            socket.off("Search.Video.Multiple-progress", onTrendingProgress);
        };
    }, [socket.connected]);
    return (
        <section className="my-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">Trending Videos</h2>
                <div className="flex items-center space-x-4">
                    <button className="p-2 bg-red-900 rounded-full hover:bg-red-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="p-2 bg-red-900 rounded-full hover:bg-red-800 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            {trendingLoading ? (
                <p>Loading Trending Videos...</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {trendingVideosData.length > 0 ? (
                        trendingVideosData.map((video, index) => (
                            <div key={video.id || index} className="flex flex-col">
                                <img src={video.thumbnails?.[0]?.url || "/placeholder-album.jpg"} alt="Video Thumbnail" className="w-full h-auto rounded-md mb-2" />
                                <p className="text-sm font-semibold">{video.title}</p> <p className="text-xs text-gray-400">{video.channelname}</p>
                            </div>
                        ))
                    ) : (
                        <p>No trending videos found</p>
                    )}
                </div>
            )}
        </section>
    );
}
export default function Home() {
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [videoUrl, setVideoUrl] = useState("");
    const [ytDlxResult, setYtDlxResult] = useState<any>(null);
    const [ytDlxProgress, setYtDlxProgress] = useState<any>(null);
    useEffect(() => {
        if (socket.connected) onConnect();
        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
            socket.io.engine.on("upgrade", transport => {
                setTransport(transport.name);
            });
        }
        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }
        function onYtDlxResponse(data: any) {
            console.log("Received yt-dlx response:", data);
            setYtDlxResult(data);
            setYtDlxProgress(null);
        }
        function onYtDlxProgress(data: any) {
            console.log("Received yt-dlx progress:", data);
            setYtDlxProgress(data.progress);
        }
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("Misc.Video.Extract-response", onYtDlxResponse);
        socket.on("Misc.Video.Extract-progress", onYtDlxProgress);
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("Misc.Video.Extract-response", onYtDlxResponse);
            socket.off("Misc.Video.Extract-progress", onYtDlxProgress);
        };
    }, []);
    const handleSearch = () => {
        if (videoUrl) {
            setYtDlxResult(null);
            setYtDlxProgress(null);
            socket.emit("yt-dlx-command", { command: "Misc.Video.Extract", options: { query: videoUrl, verbose: true } });
        }
    };
    return (
        <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,_#7f1d1d,_#000000_70%)] text-white">
            <Sidebar isConnected={isConnected} transport={transport} />
            <main className="ml-64 flex-1 flex flex-col">
                <HeaderSearch videoUrl={videoUrl} setVideoUrl={setVideoUrl} handleSearch={handleSearch} />
                <div className="flex-1 overflow-y-auto p-8">
                    {ytDlxProgress && (
                        <div className="my-4 p-4 bg-blue-900/50 rounded-md">
                            <h3 className="text-lg font-semibold mb-2">Progress:</h3> <pre>{JSON.stringify(ytDlxProgress, null, 2)}</pre>
                        </div>
                    )}
                    {ytDlxResult && (
                        <div className="my-4 p-4 bg-green-900/50 rounded-md">
                            <h3 className="text-lg font-semibold mb-2">Result:</h3> <pre>{JSON.stringify(ytDlxResult, null, 2)}</pre>
                        </div>
                    )}
                    <CategoryButtons /> <QuickPicksSection /> <BandBaajaBaraatSection />
                </div>
            </main>
        </div>
    );
}
