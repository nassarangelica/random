// src/firebase/friends.js
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc, 
  updateDoc,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore'
import { db } from './config'

// Send friend request
export const sendFriendRequest = async (fromUserId, toUserId, fromUsername, fromAvatar) => {
  try {
    // Check if request already exists
    const q = query(
      collection(db, 'friendRequests'),
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId)
    )
    const existingRequests = await getDocs(q)
    
    if (!existingRequests.empty) {
      return { success: false, error: 'Friend request already sent' }
    }

    // Create friend request
    await addDoc(collection(db, 'friendRequests'), {
      fromUserId,
      toUserId,
      fromUsername,
      fromAvatar,
      status: 'pending',
      createdAt: new Date().toISOString()
    })

    // Create notification
    await addDoc(collection(db, 'notifications'), {
      userId: toUserId,
      type: 'friend_request',
      fromUserId,
      fromUsername,
      fromAvatar,
      message: 'sent you a friend request',
      read: false,
      createdAt: new Date().toISOString()
    })

    return { success: true }
  } catch (error) {
    console.error('Send friend request error:', error)
    return { success: false, error: error.message }
  }
}

// Accept friend request
export const acceptFriendRequest = async (requestId, fromUserId, toUserId) => {
  try {
    // Update request status
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'accepted'
    })

    // Add to both users' friends arrays
    const fromUserRef = doc(db, 'users', fromUserId)
    const toUserRef = doc(db, 'users', toUserId)

    await updateDoc(fromUserRef, {
      friends: arrayUnion(toUserId)
    })

    await updateDoc(toUserRef, {
      friends: arrayUnion(fromUserId)
    })

    // Get user info for notification
    const toUserDoc = await getDoc(toUserRef)
    const toUserData = toUserDoc.data()

    // Create notification
    await addDoc(collection(db, 'notifications'), {
      userId: fromUserId,
      type: 'friend_accept',
      fromUserId: toUserId,
      fromUsername: toUserData.username,
      fromAvatar: toUserData.avatar,
      message: 'accepted your friend request',
      read: false,
      createdAt: new Date().toISOString()
    })

    return { success: true }
  } catch (error) {
    console.error('Accept friend request error:', error)
    return { success: false, error: error.message }
  }
}

// Decline friend request
export const declineFriendRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, 'friendRequests', requestId))
    return { success: true }
  } catch (error) {
    console.error('Decline friend request error:', error)
    return { success: false, error: error.message }
  }
}

// Get friend requests for a user
export const getFriendRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'friendRequests'),
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    )
    
    const querySnapshot = await getDocs(q)
    const requests = []
    
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, requests }
  } catch (error) {
    console.error('Get friend requests error:', error)
    return { success: false, error: error.message }
  }
}

// Remove friend
export const removeFriend = async (userId, friendId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const friendRef = doc(db, 'users', friendId)

    await updateDoc(userRef, {
      friends: arrayRemove(friendId)
    })

    await updateDoc(friendRef, {
      friends: arrayRemove(userId)
    })

    return { success: true }
  } catch (error) {
    console.error('Remove friend error:', error)
    return { success: false, error: error.message }
  }
}

// Check if users are friends
export const checkFriendship = async (userId, otherUserId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()
    const friends = userData?.friends || []
    
    return { success: true, isFriend: friends.includes(otherUserId) }
  } catch (error) {
    console.error('Check friendship error:', error)
    return { success: false, error: error.message }
  }
}