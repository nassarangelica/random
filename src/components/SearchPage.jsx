import { useState } from 'react'
import { searchUsers } from '../firebase/users'
import { sendFriendRequest, checkFriendship } from '../firebase/friends'

export default function SearchPage({ currentUser, onBack, onViewProfile }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.trim()) {
      setLoading(true)
      const result = await searchUsers(query)
      if (result.success) {
        // Filter out current user and check friendship status
        const filteredUsers = result.users.filter(user => user.uid !== currentUser.uid)
        
        // Check friendship status for each user
        const usersWithStatus = await Promise.all(
          filteredUsers.map(async (user) => {
            const friendshipResult = await checkFriendship(currentUser.uid, user.uid)
            return {
              ...user,
              isFriend: friendshipResult.success && friendshipResult.isFriend,
              requestSent: false
            }
          })
        )
        
        setSearchResults(usersWithStatus)
      }
      setLoading(false)
    } else {
      setSearchResults([])
    }
  }

  const handleAddFriend = async (userId, username, avatar, index) => {
    const result = await sendFriendRequest(
      currentUser.uid,
      userId,
      currentUser.username,
      currentUser.avatar
    )

    if (result.success) {
      // Update local state
      setSearchResults(searchResults.map((user, i) => 
        i === index ? { ...user, requestSent: true } : user
      ))
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-gray-600 hover:text-black transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-black"
              autoFocus
            />
            <svg 
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </nav>

      {/* Search Results */}
      <main className="max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No users found for "{searchQuery}"</p>
          </div>
        ) : !searchQuery ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>Search for users by name or username</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {searchResults.map((user, index) => (
              <div key={user.uid} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-12 h-12 rounded-full cursor-pointer"
                    onClick={() => onViewProfile(user)}
                  />
                  <div className="flex-1 cursor-pointer" onClick={() => onViewProfile(user)}>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                    )}
                  </div>
                  <div>
                    {user.isFriend ? (
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                        Friends ✓
                      </button>
                    ) : user.requestSent ? (
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                        Request Sent
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAddFriend(user.uid, user.username, user.avatar, index)}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}