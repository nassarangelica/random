// src/firebase/posts.js
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  onSnapshot
} from 'firebase/firestore'
import { db } from './config'

// Create a new post
export const createPost = async (userId, username, avatar, content) => {
  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      userId,
      username,
      avatar,
      content,
      likes: [],
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date().toISOString()
    })
    return { success: true, postId: docRef.id }
  } catch (error) {
    console.error('Create post error:', error)
    return { success: false, error: error.message }
  }
}

// Delete a post
export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId))
    return { success: true }
  } catch (error) {
    console.error('Delete post error:', error)
    return { success: false, error: error.message }
  }
}

// Like/Unlike a post
export const toggleLikePost = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId)
    
    // Check if user already liked
    const postDoc = await getDocs(query(collection(db, 'posts')))
    const post = postDoc.docs.find(doc => doc.id === postId)
    const likes = post?.data().likes || []
    
    if (likes.includes(userId)) {
      // Unlike
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        likesCount: increment(-1)
      })
    } else {
      // Like
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        likesCount: increment(1)
      })
    }
    return { success: true }
  } catch (error) {
    console.error('Toggle like error:', error)
    return { success: false, error: error.message }
  }
}

// Get all posts (real-time listener)
export const subscribeToPosts = (callback) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const posts = []
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() })
    })
    callback(posts)
  })
}

// Get posts once (no real-time)
export const getPosts = async () => {
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const posts = []
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, posts }
  } catch (error) {
    console.error('Get posts error:', error)
    return { success: false, error: error.message }
  }
}