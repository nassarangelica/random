import { useState, useEffect } from 'react'
import { getFriendRequests, acceptFriendRequest, declineFriendRequest } from '../firebase/friends'
import { getUserById } from '../firebase/users'

export default function FriendRequestsPage({ currentUser, onBack }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      const result = await getFriendRequests(currentUser.uid)
      if (result.success) {
        // Enrich requests with user data
        const enrichedRequests = await Promise.all(
          result.requests.map(async (req) => {
            const userResult = await getUserById(req.fromUserId)
            return {
              ...req,
              mutualFriends: 0 // TODO: Calculate mutual friends
            }
          })
        )
        setRequests(enrichedRequests)
      }
      setLoading(false)
    }

    fetchRequests()
  }, [currentUser.uid])

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  const handleAccept = async (requestId, fromUserId) => {
    const result = await acceptFriendRequest(requestId, fromUserId, currentUser.uid)
    if (result.success) {
      setRequests(requests.filter(req => req.id !== requestId))
    }
  }

  const handleDecline = async (requestId) => {
    const result = await declineFriendRequest(requestId)
    if (result.success) {
      setRequests(requests.filter(req => req.id !== requestId))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
          <h1 className="text-xl font-semibold">Friend Requests</h1>
          {requests.length > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {requests.length}
            </span>
          )}
        </div>
      </nav>

      {/* Requests List */}
      <main className="max-w-2xl mx-auto">
        {requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-lg font-medium mb-2">No friend requests</p>
            <p className="text-sm">When someone sends you a friend request, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-start gap-3">
                  <img 
                    src={request.fromAvatar} 
                    alt={request.fromUsername}
                    className="w-14 h-14 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{request.fromUsername}</h3>
                      <span className="text-sm text-gray-500">{formatTimestamp(request.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">@{request.fromUsername}</p>
                    {request.mutualFriends > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {request.mutualFriends} mutual friends
                      </p>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(request.id, request.fromUserId)}
                        className="flex-1 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Decline
                      </button>
                    </div>
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