// ./ytclone/src/app/(public)/watch/[videoId]/page.tsx

"use client"; // Make sure this directive is at the very top

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Import useParams
import VideoPlayer from "@/components/VideoPlayer";
import VideoDetails from "@/components/VideoDetails";
import CommentsSection from "@/components/CommentsSection";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import RelatedVideosList from "@/components/RelatedVideosList";
import { VideoDetails as VideoDetailsType, Comment, TranscriptSegment, RelatedVideo } from "@/types/youtube";

// No need for the VideoPlaybackPageProps interface if not receiving params as a prop
// interface VideoPlaybackPageProps {
//   params: {
//     videoId: string;
//   };
// }

// The component function does not receive params as a prop
const VideoPlaybackPage: React.FC = () => {
  // Use the useParams hook to get the params object
  const params = useParams();
  // Access the videoId property directly from the object returned by useParams
  const videoId = params.videoId as string; // Cast to string for TypeScript

  const [videoDetails, setVideoDetails] = useState<VideoDetailsType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Now you can use videoId obtained from useParams
    if (!videoId) {
      setError("Video ID not found in parameters.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch video details
        const detailsResponse = await fetch(`/api/video/${videoId}/details`);
        if (!detailsResponse.ok) {
          const errorData = await detailsResponse.json();
          throw new Error(errorData.error || "Failed to fetch video details");
        }
        const detailsData: VideoDetailsType = await detailsResponse.json();
        setVideoDetails(detailsData);

        // Fetch comments
        const commentsResponse = await fetch(`/api/video/${videoId}/comments`);
        if (!commentsResponse.ok) {
          console.error("Failed to fetch comments:", commentsResponse.statusText);
          setComments([]);
        } else {
          const commentsData: Comment[] = await commentsResponse.json();
          setComments(commentsData);
        }

        // Fetch transcript
        const transcriptResponse = await fetch(`/api/video/${videoId}/transcript`);
        if (!transcriptResponse.ok) {
          console.error("Failed to fetch transcript:", transcriptResponse.statusText);
          setTranscript([]);
        } else {
          const transcriptData: TranscriptSegment[] = await transcriptResponse.json();
          setTranscript(transcriptData);
        }

        // Fetch related videos
        const relatedVideosResponse = await fetch(`/api/video/${videoId}/related`);
        if (!relatedVideosResponse.ok) {
          console.error("Failed to fetch related videos:", relatedVideosResponse.statusText);
          setRelatedVideos([]);
        } else {
          const relatedVideosData: RelatedVideo[] = await relatedVideosResponse.json();
          setRelatedVideos(relatedVideosData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId]); // Depend on videoId from useParams

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
