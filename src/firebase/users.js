// src/firebase/users.js
import { 
  doc, 
  updateDoc, 
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from './config'

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, updates)
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: error.message }
  }
}

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { success: true, user: docSnap.data() }
    } else {
      return { success: false, error: 'User not found' }
    }
  } catch (error) {
    console.error('Get user error:', error)
    return { success: false, error: error.message }
  }
}

// Search users by username or name
export const searchUsers = async (searchTerm) => {
  try {
    const usersRef = collection(db, 'users')
    const querySnapshot = await getDocs(usersRef)
    
    const users = []
    querySnapshot.forEach((doc) => {
      const userData = doc.data()
      const searchLower = searchTerm.toLowerCase()
      
      if (
        userData.username.toLowerCase().includes(searchLower) ||
        userData.name.toLowerCase().includes(searchLower)
      ) {
        users.push({ id: doc.id, ...userData })
      }
    })
    
    return { success: true, users }
  } catch (error) {
    console.error('Search users error:', error)
    return { success: false, error: error.message }
  }
}

// Get user's posts
export const getUserPosts = async (userId) => {
  try {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    const posts = []
    
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, posts }
  } catch (error) {
    console.error('Get user posts error:', error)
    return { success: false, error: error.message }
  }
}