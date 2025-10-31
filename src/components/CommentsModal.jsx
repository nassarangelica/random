import { useState, useEffect } from 'react'
import { getComments, addComment } from '../firebase/comments'
import { toggleReaction, getReactions } from '../firebase/reactions'

export default function CommentsModal({ post, currentUser, onClose }) {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [reactions, setReactions] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      // Fetch comments
      const result = await getComments(post.id)
      if (result.success) {
        setComments(result.comments)
        
        // Fetch reactions for each comment
        const reactionsData = {}
        for (const comment of result.comments) {
          const reactionResult = await getReactions('comment', comment.id)
          if (reactionResult.success) {
            reactionsData[comment.id] = reactionResult.reactions
          }
          
          // Fetch reactions for replies
          if (comment.replies) {
            for (const reply of comment.replies) {
              const replyReactionResult = await getReactions('reply', reply.id)
              if (replyReactionResult.success) {
                reactionsData[reply.id] = replyReactionResult.reactions
              }
            }
          }
        }
        setReactions(reactionsData)
      }
      setLoading(false)
    }

    fetchData()
  }, [post.id])

  const handleReaction = async (itemType, itemId, emoji) => {
    const result = await toggleReaction(itemType, itemId, currentUser.uid, emoji)
    if (result.success) {
      // Re-fetch reactions
      const reactionResult = await getReactions(itemType, itemId)
      if (reactionResult.success) {
        setReactions(prev => ({
          ...prev,
          [itemId]: reactionResult.reactions
        }))
      }
    }
  }

  const handleAddReply = async (commentId) => {
    if (replyText.trim()) {
      const result = await addReply(
        post.id,
        commentId,
        currentUser.uid,
        currentUser.username,
        currentUser.avatar,
        replyText
      )

      if (result.success) {
        // Update local state
        setComments(comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), {
                id: result.replyId,
                postId: post.id,
                commentId,
                userId: currentUser.uid,
                username: currentUser.username,
                avatar: currentUser.avatar,
                content: replyText,
                createdAt: new Date().toISOString()
              }]
            }
          }
          return comment
        }))
        setReplyText('')
        setReplyingTo(null)
      }
    }
  }

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return 'Yesterday'
  }

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const result = await addComment(
        post.id,
        currentUser.uid,
        currentUser.username,
        currentUser.avatar,
        newComment
      )

      if (result.success) {
        const comment = {
          id: result.commentId,
          postId: post.id,
          userId: currentUser.uid,
          username: currentUser.username,
          avatar: currentUser.avatar,
          content: newComment,
          createdAt: new Date().toISOString()
        }
        setComments([comment, ...comments])
        setNewComment('')
      }
    }
  }

  const ReactionButton = ({ itemType, itemId, emoji }) => {
    const itemReactions = reactions[itemId] || {}
    const count = itemReactions[emoji]?.length || 0
    const hasReacted = itemReactions[emoji]?.includes(currentUser.uid)

    return (
      <button
        onClick={() => handleReaction(itemType, itemId, emoji)}
        className={`px-2 py-1 rounded-full text-xs transition-all ${
          hasReacted 
            ? 'bg-blue-100 border border-blue-400' 
            : 'bg-gray-100 hover:bg-gray-200 border border-transparent'
        }`}
      >
        {emoji} {count > 0 && <span className="ml-1 font-semibold">{count}</span>}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Comments</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Original Post */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex gap-3">
            <img 
              src={post.avatar} 
              alt={post.username}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{post.username}</span>
                <span className="text-gray-500 text-sm">{formatTimestamp(post.createdAt)}</span>
              </div>
              <p className="text-gray-800">{post.content}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  {/* Comment */}
                  <div className="flex gap-3">
                    <img 
                      src={comment.avatar} 
                      alt={comment.username}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.username}</span>
                        <span className="text-gray-500 text-xs">{formatTimestamp(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-800 text-sm mb-2">{comment.content}</p>
                      
                      {/* Comment Reactions */}
                      <div className="flex items-center gap-2 mb-2">
                        <ReactionButton itemType="comment" itemId={comment.id} emoji="❤️" />
                        <ReactionButton itemType="comment" itemId={comment.id} emoji="😂" />
                        <ReactionButton itemType="comment" itemId={comment.id} emoji="👍" />
                      </div>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                      </button>
                    </div>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="ml-11 mt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-black"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
                        />
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <img 
                            src={reply.avatar} 
                            alt={reply.username}
                            className="w-6 h-6 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs">{reply.username}</span>
                              <span className="text-gray-500 text-xs">{formatTimestamp(reply.createdAt)}</span>
                            </div>
                            <p className="text-gray-800 text-xs mb-1">{reply.content}</p>
                            
                            {/* Reply Reactions */}
                            <div className="flex items-center gap-1">
                              <ReactionButton itemType="reply" itemId={reply.id} emoji="❤️" />
                              <ReactionButton itemType="reply" itemId={reply.id} emoji="😂" />
                              <ReactionButton itemType="reply" itemId={reply.id} emoji="👍" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Comment */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <img 
              src={currentUser.avatar}
              alt="You"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-black"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}