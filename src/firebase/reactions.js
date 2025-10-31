import { db } from './config'
import { collection, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

// Toggle reaction on a post/comment/reply
export const toggleReaction = async (itemType, itemId, userId, emoji, parentId = null) => {
  try {
    const reactionRef = doc(db, `${itemType}Reactions`, itemId)
    const reactionDoc = await getDoc(reactionRef)
    
    if (!reactionDoc.exists()) {
      // Create new reaction document
      await setDoc(reactionRef, {
        [emoji]: [userId],
        itemId,
        parentId
      })
      return { success: true }
    }
    
    const reactions = reactionDoc.data()
    const userReacted = reactions[emoji]?.includes(userId)
    
    if (userReacted) {
      // Remove reaction
      await updateDoc(reactionRef, {
        [emoji]: arrayRemove(userId)
      })
    } else {
      // Add reaction
      await updateDoc(reactionRef, {
        [emoji]: arrayUnion(userId)
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error toggling reaction:', error)
    return { success: false, error: error.message }
  }
}

// Get reactions for an item
export const getReactions = async (itemType, itemId) => {
  try {
    const reactionRef = doc(db, `${itemType}Reactions`, itemId)
    const reactionDoc = await getDoc(reactionRef)
    
    if (reactionDoc.exists()) {
      return { success: true, reactions: reactionDoc.data() }
    }
    return { success: true, reactions: {} }
  } catch (error) {
    console.error('Error getting reactions:', error)
    return { success: false, error: error.message }
  }
}