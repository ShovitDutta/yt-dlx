// ./ytclone/src/components/TranscriptDisplay.tsx

import React from 'react';
import { TranscriptSegment } from '@/types/youtube'; // Import the TranscriptSegment interface

interface TranscriptDisplayProps {
  transcript: TranscriptSegment[]; // Use the imported TranscriptSegment interface
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  if (!transcript || transcript.length === 0) {
    return <div className="mt-4 text-gray-600">No transcript available.</div>;
  }

  // Basic formatting for display
  const formattedTranscript = transcript.map(segment => segment.text).join(' ');

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Transcript</h3>
      <div className="mt-2 p-4 bg-gray-100 rounded-md max-h-60 overflow-y-auto text-sm text-gray-800">
        {formattedTranscript}
      </div>
    </div>
  );
};

export default TranscriptDisplay;