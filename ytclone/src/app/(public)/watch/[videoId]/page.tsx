// ./ytclone/src/app/(public)/watch/[videoId]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import VideoDetails from '@/components/VideoDetails';
import CommentsSection from '@/components/CommentsSection';
import TranscriptDisplay from '@/components/TranscriptDisplay';
import RelatedVideosList from '@/components/RelatedVideosList';
import { VideoDetails as VideoDetailsType, Comment, TranscriptSegment, RelatedVideo } from '@/types/youtube'; // Import interfaces

interface VideoPlaybackPageProps {
  params: {
    videoId: string;
  };
}

const VideoPlaybackPage: React.FC<VideoPlaybackPageProps> = ({ params }) => {
  const { videoId } = params;
  const [videoDetails, setVideoDetails] = useState<VideoDetailsType | null>(null); // Use imported interface
  const [comments, setComments] = useState<Comment[]>([]); // Use imported interface
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]); // Use imported interface
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]); // Use imported interface
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch video details
        const detailsResponse = await fetch(`/api/video/${videoId}/details`);
        if (!detailsResponse.ok) {
          const errorData = await detailsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch video details');
        }
        const detailsData: VideoDetailsType = await detailsResponse.json(); // Cast to imported interface
        setVideoDetails(detailsData);

        // Fetch comments
        const commentsResponse = await fetch(`/api/video/${videoId}/comments`);
        if (!commentsResponse.ok) {
           console.error('Failed to fetch comments:', commentsResponse.statusText);
           setComments([]);
        } else {
           const commentsData: Comment[] = await commentsResponse.json(); // Cast to imported interface
           setComments(commentsData);
        }


        // Fetch transcript
        const transcriptResponse = await fetch(`/api/video/${videoId}/transcript`);
         if (!transcriptResponse.ok) {
           console.error('Failed to fetch transcript:', transcriptResponse.statusText);
           setTranscript([]);
        } else {
           const transcriptData: TranscriptSegment[] = await transcriptResponse.json(); // Cast to imported interface
           setTranscript(transcriptData);
        }


        // Fetch related videos
        const relatedVideosResponse = await fetch(`/api/video/${videoId}/related`);
         if (!relatedVideosResponse.ok) {
           console.error('Failed to fetch related videos:', relatedVideosResponse.statusText);
           setRelatedVideos([]);
        } else {
           const relatedVideosData: RelatedVideo[] = await relatedVideosResponse.json(); // Cast to imported interface
           setRelatedVideos(relatedVideosData);
        }


      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading video...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VideoPlayer videoId={videoId} />
          <VideoDetails details={videoDetails} />
          <CommentsSection comments={comments} />
          <TranscriptDisplay transcript={transcript} />
        </div>
        <div>
          <RelatedVideosList relatedVideos={relatedVideos} />
        </div>
      </div>
    </div>
  );
};

export default VideoPlaybackPage;
