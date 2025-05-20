import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface VideoType {
    type: string;
    title: string;
    videoId: string;
    authorId: string;
    authorUrl: string;
    viewCount: string;
    authorName: string;
    description: string;
    authorBadges: any[];
    shortViewCount: string;
    thumbnails: { url: string; width: number; height: number }[];
    authorThumbnails: { url: string; width: number; height: number }[];
}

interface VideoModalProps {
    video: VideoType | null;
    onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
    if (!video) {
        return null;
    }

    return (
        <AnimatePresence>
            {video && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose} // Close modal when clicking outside
                >
                    <motion.div
                        className="bg-neutral-900 rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                    >
                        <h2 className="text-2xl font-bold text-white mb-4">{video.title}</h2>
                        <p className="text-orange-400 text-sm mb-2">{video.authorName}</p>
                        {video.thumbnails && video.thumbnails.length > 0 && (
                            <Image
                                src={video.thumbnails[0].url}
                                alt={video.title}
                                width={400}
                                height={225}
                                className="w-full rounded-md mb-4"
                            />
                        )}
                        <p className="text-white mb-4">{video.description}</p>
                        <div className="flex items-center text-orange-500 text-sm">
                            <span>{video.viewCount} views</span>
                            {/* Add more details here */}
                        </div>
                        <button
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoModal;
