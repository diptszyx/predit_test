import React from 'react';

export default function CommentSection() {
  return (
    <div
      ref={commentsRef}
      className="mt-12"
    >
      <h3 className="mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Discussion ({comments.length})
      </h3>

      {/* Comment Input */}
      <Card className="border-border mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80'
              }
              alt="Your avatar"
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your thoughts on this article..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none border-border focus:border-blue-500/50"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handlePostComment}
                  size="sm"
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-1">
        {comments.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card
              key={comment.id}
              className="border-border hover:bg-accent/30 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <img
                    src={comment.avatar}
                    alt={comment.username}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">
                        {comment.username}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        Lvl {comment.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm break-words mb-3">
                      {comment.content}
                    </p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        {comment.likes > 0 && <span>{comment.likes}</span>}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
