"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface PostActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  showCommentButton?: boolean;
}

export function PostActions({
  postId,
  likesCount,
  commentsCount,
  likedByCurrentUser,
  onLike,
  onComment,
  onShare,
  showCommentButton = true,
}: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(likedByCurrentUser);
  const [likes, setLikes] = useState(likesCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    onLike?.(postId);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={`gap-1.5 ${isLiked ? "text-pink-600 hover:text-pink-700" : "text-stone-600 hover:text-stone-900"}`}
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        <span className="text-sm">{likes}</span>
      </Button>

      {showCommentButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onComment?.(postId)}
          className="gap-1.5 text-stone-600 hover:text-stone-900"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{commentsCount}</span>
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onShare?.(postId)}
        className="text-stone-600 hover:text-stone-900"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
