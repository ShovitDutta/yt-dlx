import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoDetailsModalProps {
    video: {
        title: string;
        authorName: string;
        description: string;
        viewCount: string;
        // Add other video details you want to display
    } | null;
    onClose: () => void;
}

const VideoDetailsModal: React.FC<VideoDetailsModalProps> = ({ video, onClose }) => {
    if (!video) {
        return null;
    }

    return (
        <AnimatePresence>
            {video && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}>
                    <motion.div
                        className="bg-neutral-900 backdrop-blur-lg rounded-xl p-6 w-11/12 md:max-w-md lg:max-w-lg max-h-[80vh] overflow-y-auto text-white"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
                    >
                        <h3 className="text-2xl font-semibold mb-4">{video.title}</h3>
                        <p className="text-orange-400 text-sm mb-2">{video.authorName}</p>
                        <p className="text-sm mb-4">{video.description}</p>
                        <div className="flex items-center text-orange-500 text-sm">
                            <span>{video.viewCount} views</span>
                            {/* Add more details here */}
                        </div>
                        <button className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={onClose}>
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoDetailsModal;
