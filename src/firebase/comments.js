// src/firebase/comments.js
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore'
import { db } from './config'

// Add a comment to a post
export const addComment = async (postId, userId, username, avatar, content) => {
  try {
    // Add comment document
    const docRef = await addDoc(collection(db, 'comments'), {
      postId,
      userId,
      username,
      avatar,
      content,
      createdAt: new Date().toISOString()
    })

    // Increment post's comment count
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, {
      commentsCount: increment(1)
    })

    return { success: true, commentId: docRef.id }
  } catch (error) {
    console.error('Add comment error:', error)
    return { success: false, error: error.message }
  }
}

// Get comments for a post
export const getComments = async (postId) => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const comments = []
    
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, comments }
  } catch (error) {
    console.error('Get comments error:', error)
    return { success: false, error: error.message }
  }
}