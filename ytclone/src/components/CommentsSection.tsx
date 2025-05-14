// ./ytclone/src/components/CommentsSection.tsx

import React from 'react';
import { Comment } from '@/types/youtube'; // Import the Comment interface

interface CommentsSectionProps {
  comments: Comment[]; // Use the imported Comment interface
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <div className="mt-4 text-gray-600">No comments found.</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
      <div className="mt-2 space-y-4">
        {comments.map((comment) => (
          <div key={comment.comment_id} className="border-b pb-4">
            <p className="text-sm font-semibold">{comment.author}</p>
            <p className="text-sm text-gray-800 mt-1">{comment.comment}</p>
            <p className="text-xs text-gray-500 mt-1">
              {comment.published_time} - {comment.like_count} likes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;