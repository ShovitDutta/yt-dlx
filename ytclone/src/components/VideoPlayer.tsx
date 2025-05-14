// ./ytclone/src/components/VideoPlayer.tsx

import React from 'react';

interface VideoPlayerProps {
  videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  // Construct the URL for the HTTP streaming API route
  const streamUrl = `/api/video/${videoId}/stream`;

  return (
    <div className="w-full aspect-video bg-black">
      <video controls width="100%" height="100%" src={streamUrl}>
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;