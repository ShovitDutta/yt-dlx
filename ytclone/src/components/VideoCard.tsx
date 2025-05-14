// ./ytclone/src/components/VideoCard.tsx

import React from 'react';
import Link from 'next/link';
import { Video } from '@/types/youtube'; // Import the Video interface

interface VideoCardProps {
  video: Video; // Use the imported Video interface
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const thumbnailUrl = video.thumbnails?.[0]?.url || '/placeholder.png'; // Use a placeholder if no thumbnail

  return (
    <Link href={`/watch/${video.id}`}>
      <div className="cursor-pointer border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <img src={thumbnailUrl} alt={video.title} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate">{video.title}</h3>
          <p className="text-sm text-gray-600">{video.channelname}</p>
          {video.viewCount !== undefined && (
            <p className="text-sm text-gray-600">{video.viewCount.toLocaleString()} views</p>
          )}
          {video.uploadDate && (
            <p className="text-sm text-gray-600">Uploaded on {video.uploadDate}</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;