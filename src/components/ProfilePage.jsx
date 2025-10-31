import { useState, useEffect } from 'react'
import { updateUserProfile } from '../firebase/users'
import { getUserPosts } from '../firebase/users'
import EditProfileModal from './EditProfileModal'

export default function ProfilePage({ currentUser, onBack }) {
  const [activeTab, setActiveTab] = useState('posts')
  const [showEditModal, setShowEditModal] = useState(false)
  const [profile, setProfile] = useState(currentUser)
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      const result = await getUserPosts(currentUser.uid)
      if (result.success) {
        setUserPosts(result.posts)
      }
      setLoading(false)
    }

    fetchPosts()
  }, [currentUser.uid])

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

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

  const handleSaveProfile = async (updatedProfile) => {
    const result = await updateUserProfile(currentUser.uid, {
      name: updatedProfile.name,
      username: updatedProfile.username,
      bio: updatedProfile.bio,
      avatar: updatedProfile.avatar
    })

    if (result.success) {
      setProfile(prev => ({
        ...prev,
        ...updatedProfile
      }))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="text-gray-600 hover:text-black transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-xl font-semibold">Minds</span>
          </div>

          <button className="text-gray-600 hover:text-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="p-6">
          {/* Name and Avatar */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">@{profile.username}</p>
            </div>
            <img 
              src={profile.avatar} 
              alt={profile.name}
              className="w-20 h-20 rounded-full border-2 border-gray-200"
            />
          </div>

          {/* Bio */}
          <p className="text-gray-800 mb-4">{profile.bio || 'No bio yet'}</p>

          {/* Stats */}
          <div className="flex gap-6 mb-4 text-sm">
            <button className="hover:underline">
              <span className="font-semibold text-gray-900">{formatNumber(profile.friends?.length || 0)}</span>
              <span className="text-gray-600"> friends</span>
            </button>
            <button className="hover:underline">
              <span className="font-semibold text-gray-900">{userPosts.length}</span>
              <span className="text-gray-600"> posts</span>
            </button>
          </div>

          {/* Edit Profile Button */}
          <button 
            onClick={() => setShowEditModal(true)}
            className="w-full py-2 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition"
          >
            Edit Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'posts'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('replies')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'replies'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Replies
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex-1 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'media'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Media
            </button>
          </div>
        </div>

        {/* Posts List */}
        {activeTab === 'posts' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No posts yet</p>
              </div>
            ) : (
              userPosts.map((post) => (
                <div key={post.id} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition">
                  <div className="flex gap-3">
                    <img 
                      src={profile.avatar} 
                      alt={profile.username}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{profile.username}</span>
                        <span className="text-gray-500 text-sm">{formatTimestamp(post.createdAt)}</span>
                      </div>
                      
                      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                      
                      <div className="flex gap-6 text-gray-500">
                        <button className="flex items-center gap-2 hover:text-red-500 transition group">
                          <svg 
                            className={`w-5 h-5 ${post.likes?.includes(currentUser.uid) ? 'fill-red-500 text-red-500' : 'fill-none'}`}
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className={`text-sm ${post.likes?.includes(currentUser.uid) ? 'text-red-500' : ''}`}>{post.likesCount || 0}</span>
                        </button>
                        
                        <button className="flex items-center gap-2 hover:text-blue-500 transition">
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
        )}

        {activeTab === 'replies' && (
          <div className="p-8 text-center text-gray-500">
            <p>No replies yet</p>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="p-8 text-center text-gray-500">
            <p>No media yet</p>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal 
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  )
}