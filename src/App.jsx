import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import { signIn, signUp, logOut, getUserProfile } from './firebase/auth'
import FeedPage from './components/FeedPage'
import ProfilePage from './components/ProfilePage'
import SearchPage from './components/SearchPage'
import FriendRequestsPage from './components/FriendRequestsPage'
import NotificationsPage from './components/NotificationsPage'
import CommentsModal from './components/CommentsModal'

export default function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('feed')
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [error, setError] = useState('')

  // Listen to authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const profileResult = await getUserProfile(user.uid)
        if (profileResult.success) {
          setCurrentUser(profileResult.data)
          setLoggedIn(true)
        }
      } else {
        // User is signed out
        setCurrentUser(null)
        setLoggedIn(false)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    
    const result = await signIn(loginEmail, loginPassword)
    
    if (result.success) {
      setShowLogin(false)
      setLoginEmail('')
      setLoginPassword('')
    } else {
      setError(result.error)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    
    const result = await signUp(signupEmail, signupPassword, signupUsername, signupName)
    
    if (result.success) {
      setShowSignup(false)
      setSignupName('')
      setSignupUsername('')
      setSignupEmail('')
      setSignupPassword('')
    } else {
      setError(result.error)
    }
  }

  const handleLogout = async () => {
    await logOut()
    setCurrentPage('feed')
  }

  const handleOpenComments = (post) => {
    setSelectedPost(post)
    setShowCommentsModal(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // 👇 If logged in, show the appropriate page
  if (loggedIn && currentUser) {
    if (currentPage === 'profile') {
      return <ProfilePage currentUser={currentUser} onBack={() => setCurrentPage('feed')} />
    }
    
    if (currentPage === 'search') {
      return (
        <SearchPage 
          currentUser={currentUser}
          onBack={() => setCurrentPage('feed')}
          onViewProfile={(user) => {
            console.log('View profile:', user)
            setCurrentPage('profile')
          }}
        />
      )
    }
    
    if (currentPage === 'notifications') {
      return (
        <NotificationsPage 
          currentUser={currentUser}
          onBack={() => setCurrentPage('feed')}
        />
      )
    }
    
    if (currentPage === 'friendRequests') {
      return (
        <FriendRequestsPage 
          currentUser={currentUser}
          onBack={() => setCurrentPage('feed')}
        />
      )
    }

    // Default: Show Feed Page
    return (
      <>
        <FeedPage 
          currentUser={currentUser}
          onProfileClick={() => setCurrentPage('profile')}
          onSearchClick={() => setCurrentPage('search')}
          onNotificationsClick={() => setCurrentPage('notifications')}
          onFriendRequestsClick={() => setCurrentPage('friendRequests')}
          onOpenComments={handleOpenComments}
          onLogout={handleLogout}
        />
        
        {/* Comments Modal */}
        {showCommentsModal && selectedPost && (
          <CommentsModal
            post={selectedPost}
            currentUser={currentUser}
            onClose={() => setShowCommentsModal(false)}
          />
        )}
      </>
    )
  }

  // 👇 Default: Landing Page with login/signup
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <span className="text-xl font-semibold">Minds</span>
        </div>
        <button 
          onClick={() => setShowLogin(true)}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition"
        >
          Log in
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold mb-6 tracking-tight">
          Share your thoughts,<br />connect with others
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          A simple and clean space to express yourself, follow interesting people, and join conversations that matter.
        </p>
        
        <button 
          onClick={() => setShowSignup(true)}
          className="px-8 py-4 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition"
        >
          Get Started
        </button>

        {/* Preview Cards */}
        <div className="mt-20 grid md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-2xl text-left hover:border-gray-300 transition">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">✍️</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Post Anything</h3>
            <p className="text-gray-600 text-sm">Share your thoughts, ideas, and moments with your friends.</p>
          </div>

          <div className="p-6 border border-gray-200 rounded-2xl text-left hover:border-gray-300 transition">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Customize Profile</h3>
            <p className="text-gray-600 text-sm">Create your unique profile and let others know who you are.</p>
          </div>

          <div className="p-6 border border-gray-200 rounded-2xl text-left hover:border-gray-300 transition">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Join Conversations</h3>
            <p className="text-gray-600 text-sm">Connect with people and engage in meaningful discussions.</p>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Log in</h2>
              <button 
                onClick={() => {
                  setShowLogin(false)
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
              >
                Log in
              </button>
            </div>

            <p className="text-center mt-6 text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => {
                  setShowLogin(false)
                  setShowSignup(true)
                  setError('')
                }}
                className="text-black font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Sign up</h2>
              <button 
                onClick={() => {
                  setShowSignup(false)
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
              <input
                type="text"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
              <input
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-black"
              />
              <button
                onClick={handleSignup}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition"
              >
                Sign up
              </button>
            </div>

            <p className="text-center mt-6 text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => {
                  setShowSignup(false)
                  setShowLogin(true)
                  setError('')
                }}
                className="text-black font-medium hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}