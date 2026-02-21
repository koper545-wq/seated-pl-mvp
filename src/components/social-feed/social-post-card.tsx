"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SentimentBadge } from "./sentiment-badge";
import { PostActions } from "./post-actions";
import { SocialPost, SocialComment, getPostComments } from "@/lib/mock-data";
import {
  Calendar,
  Star,
  Award,
  ChefHat,
  MapPin,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

interface SocialPostCardProps {
  post: SocialPost;
  showComments?: boolean;
}

export function SocialPostCard({ post, showComments = false }: SocialPostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(showComments);
  const [comments, setComments] = useState<SocialComment[]>(() =>
    getPostComments(post.id)
  );
  const [newComment, setNewComment] = useState("");

  const getPostIcon = () => {
    switch (post.type) {
      case "attended_event":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "reviewed":
        return <Star className="h-4 w-4 text-amber-600" />;
      case "hosted_event":
        return <ChefHat className="h-4 w-4 text-rose-600" />;
      case "earned_badge":
        return <Award className="h-4 w-4 text-purple-600" />;
      case "going_to_event":
        return <MapPin className="h-4 w-4 text-green-600" />;
      case "recommended":
        return <Star className="h-4 w-4 text-pink-600" />;
      default:
        return null;
    }
  };

  const getPostAction = () => {
    switch (post.type) {
      case "attended_event":
        return "uczestniczył(a) w wydarzeniu";
      case "reviewed":
        return "dodał(a) opinię";
      case "hosted_event":
        return "zorganizował(a) wydarzenie";
      case "earned_badge":
        return "zdobył(a) odznakę";
      case "going_to_event":
        return "wybiera się na";
      case "recommended":
        return "poleca";
      default:
        return "";
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: SocialComment = {
      id: `sc-new-${Date.now()}`,
      postId: post.id,
      userId: "user-current",
      userName: "Ty",
      text: newComment,
      createdAt: new Date(),
    };
    setComments([...comments, comment]);
    setNewComment("");
  };

  const initials = post.userName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex gap-3 mb-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            {post.userAvatar && <AvatarImage src={post.userAvatar} alt={post.userName} />}
            <AvatarFallback className="bg-amber-100 text-amber-700 text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-stone-900">{post.userName}</span>
              {post.userLevelIcon && (
                <span className="text-sm" title={`Poziom ${post.userLevel}`}>
                  {post.userLevelIcon}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getPostIcon()}
              <span>{getPostAction()}</span>
              <span>·</span>
              <span>
                {formatDistanceToNow(post.createdAt, {
                  addSuffix: true,
                  locale: pl,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Content based on type */}
        {(post.type === "attended_event" ||
          post.type === "reviewed" ||
          post.type === "going_to_event" ||
          post.type === "recommended" ||
          post.type === "hosted_event") &&
          post.eventId && (
            <Link href={`/events/${post.eventId}`}>
              <div className="bg-stone-50 rounded-lg p-3 mb-3 hover:bg-stone-100 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 line-clamp-1">
                      {post.eventTitle}
                    </p>
                    {post.eventDate && (
                      <p className="text-sm text-stone-500">{post.eventDate}</p>
                    )}
                    {post.hostName && (
                      <p className="text-sm text-stone-500">Host: {post.hostName}</p>
                    )}
                    {post.eventType && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {post.eventType}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )}

        {/* Badge earned */}
        {post.type === "earned_badge" && post.badgeName && (
          <div className="bg-purple-50 rounded-lg p-4 mb-3 text-center">
            <span className="text-4xl block mb-2">{post.badgeIcon}</span>
            <p className="font-medium text-purple-900">{post.badgeName}</p>
          </div>
        )}

        {/* Review text and sentiment */}
        {post.reviewText && (
          <p className="text-stone-700 mb-3">{post.reviewText}</p>
        )}

        {/* Sentiment and rating */}
        <div className="flex items-center gap-3 mb-3">
          {post.sentiment && <SentimentBadge sentiment={post.sentiment} />}
          {post.rating && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < post.rating! ? "fill-amber-400 text-amber-400" : "text-stone-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-3">
          <PostActions
            postId={post.id}
            likesCount={post.likesCount}
            commentsCount={comments.length}
            likedByCurrentUser={post.likedByCurrentUser}
            onComment={() => setIsCommentsOpen(!isCommentsOpen)}
          />

          {comments.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="text-stone-600"
            >
              {isCommentsOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ukryj
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {comments.length} komentarz{comments.length === 1 ? "" : comments.length < 5 ? "e" : "y"}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Comments section */}
        {isCommentsOpen && (
          <div className="mt-3 pt-3 border-t space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {comment.userAvatar && (
                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                  )}
                  <AvatarFallback className="bg-stone-100 text-stone-600 text-xs">
                    {comment.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-stone-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-stone-900">
                      {comment.userName}
                    </span>
                    <span className="text-xs text-stone-500">
                      {formatDistanceToNow(comment.createdAt, {
                        addSuffix: true,
                        locale: pl,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700">{comment.text}</p>
                </div>
              </div>
            ))}

            {/* Add comment */}
            <div className="flex gap-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                  MN
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Dodaj komentarz..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
