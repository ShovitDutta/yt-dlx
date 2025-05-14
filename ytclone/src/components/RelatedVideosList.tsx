// ./ytclone/src/components/RelatedVideosList.tsx

import React from 'react';
import Link from 'next/link';
import { RelatedVideo } from '@/types/youtube'; // Import the RelatedVideo interface

interface RelatedVideosListProps {
  relatedVideos: RelatedVideo[]; // Use the imported RelatedVideo interface
}

const RelatedVideosList: React.FC<RelatedVideosListProps> = ({ relatedVideos }) => {
  if (!relatedVideos || relatedVideos.length === 0) {
    return <div className="mt-4 text-gray-600">No related videos found.</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Related Videos</h3>
      <div className="mt-2 space-y-4">
        {relatedVideos.map((video) => (
          <Link key={video.id} href={`/watch/${video.id}`}>
            <div className="flex items-center cursor-pointer hover:bg-gray-100 rounded-md p-2">
              <img
                src={video.thumbnails?.[0]?.url || '/placeholder.png'}
                alt={video.title}
                className="w-24 h-14 object-cover rounded-md flex-shrink-0"
              />
              <div className="ml-3">
                <p className="text-sm font-semibold line-clamp-2">{video.title}</p>
                {/* Add channel name or other details if available in the related video data */}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedVideosList;
