import { useState, useEffect } from 'react'
import { subscribeToPosts, createPost, deletePost, toggleLikePost } from '../firebase/posts'
import { getUnreadCount } from '../firebase/notifications'
import { getFriendRequests } from '../firebase/friends'

export default function FeedPage({
  currentUser,
  onProfileClick,
  onSearchClick,
  onNotificationsClick,
  onFriendRequestsClick,
  onOpenComments,
  onLogout
}) {
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [notificationCount, setNotificationCount] = useState(0)
  const [friendRequestCount, setFriendRequestCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Subscribe to posts (real-time)
  useEffect(() => {
    const unsubscribe = subscribeToPosts((postsData) => {
      setPosts(postsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Get notification and friend request counts
  useEffect(() => {
    const fetchCounts = async () => {
      const notifResult = await getUnreadCount(currentUser.uid)
      if (notifResult.success) {
        setNotificationCount(notifResult.count)
      }

      const friendReqResult = await getFriendRequests(currentUser.uid)
      if (friendReqResult.success) {
        setFriendRequestCount(friendReqResult.requests.length)
      }
    }

    fetchCounts()
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [currentUser.uid])

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    
    const options = { month: 'short', day: 'numeric' }
    if (now.getFullYear() !== date.getFullYear()) {
      options.year = 'numeric'
    }
    return date.toLocaleDateString('en-US', options)
  }

  const handleLike = async (postId) => {
    await toggleLikePost(postId, currentUser.uid)
  }

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(postId)
    }
  }

  const handleCreatePost = async () => {
    if (newPost.trim()) {
      await createPost(
        currentUser.uid,
        currentUser.username,
        currentUser.avatar,
        newPost
      )
      setNewPost('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-xl font-semibold">Minds</span>
          </div>
          
          <div className="flex gap-6">
            <button className="text-black">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </button>
            
            <button onClick={onSearchClick} className="text-gray-500 hover:text-black transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <button onClick={onFriendRequestsClick} className="text-gray-500 hover:text-black transition relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {friendRequestCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {friendRequestCount}
                </span>
              )}
            </button>
            
            <button onClick={onNotificationsClick} className="text-gray-500 hover:text-black transition relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            
            <button onClick={onProfileClick} className="text-gray-500 hover:text-black transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Feed */}
      <main className="max-w-2xl mx-auto">
        {/* Create Post Section */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-3">
            <img 
              src={currentUser.avatar}
              alt="Your avatar" 
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full resize-none outline-none text-gray-800 placeholder-gray-400"
                rows="3"
              />
              {newPost && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCreatePost}
                    className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div>
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition">
                <div className="flex gap-3">
                  <img 
                    src={post.avatar} 
                    alt={post.username} 
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{post.username}</span>
                        <span className="text-gray-500 text-sm">{formatTimestamp(post.createdAt)}</span>
                      </div>
                      
                      {post.userId === currentUser.uid && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                          title="Delete post"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex gap-6 text-gray-500">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 hover:text-red-500 transition group"
                      >
                        <svg 
                          className={`w-5 h-5 ${post.likes?.includes(currentUser.uid) ? 'fill-red-500 text-red-500' : 'fill-none group-hover:fill-red-500'}`}
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className={`text-sm ${post.likes?.includes(currentUser.uid) ? 'text-red-500' : ''}`}>
                          {post.likesCount || 0}
                        </span>
                      </button>
                      
                      <button 
                        onClick={() => onOpenComments(post)}
                        className="flex items-center gap-2 hover:text-blue-500 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="text-sm">{post.commentsCount || 0}</span>
                      </button>
                      
                      <button className="flex items-center gap-2 hover:text-green-500 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}