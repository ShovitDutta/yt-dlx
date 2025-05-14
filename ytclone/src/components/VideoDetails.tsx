// ./ytclone/src/components/VideoDetails.tsx

import React from 'react';
import { VideoDetails as VideoDetailsType } from '@/types/youtube'; // Import and rename to avoid conflict

interface VideoDetailsProps {
  details: VideoDetailsType | null; // Use the imported VideoDetailsType interface
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ details }) => {
  if (!details || !details.meta_data) {
    return null; // Or a loading/error state
  }

  const { meta_data, AudioHighF, VideoHighF, ManifestHigh } = details;

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold">{meta_data.title}</h2>
      <p className="text-sm text-gray-600">{meta_data.channel_name}</p>
      <p className="text-sm text-gray-600">{meta_data.view_count_formatted} views</p>
      <p className="text-sm text-gray-600">Uploaded on {meta_data.upload_date}</p>
      {meta_data.description && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Description</h3>
          <p className="text-sm text-gray-700">{meta_data.description}</p>
        </div>
      )}

      {/* Displaying some format information */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Available Formats (Highlights)</h3>
        {AudioHighF && (
          <p className="text-sm text-gray-700">Highest Audio: {AudioHighF.format} ({AudioHighF.filesizeP})</p>
        )}
        {VideoHighF && (
           <p className="text-sm text-gray-700">Highest Video: {VideoHighF.format} ({VideoHighF.filesizeP})</p>
        )}
        {ManifestHigh && ManifestHigh.length > 0 && (
          <div className="text-sm text-gray-700">
            Highest Manifest Formats:
            <ul>
              {ManifestHigh.map((format, index) => ( // Use format directly as it conforms to Format interface
                <li key={index}>{format.format} ({format.tbr} tbr)</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetails;