// src/firebase/notifications.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc,
  orderBy,
  onSnapshot
} from 'firebase/firestore'
import { db } from './config'

// Get notifications for a user
export const getNotifications = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const notifications = []
    
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() })
    })
    
    return { success: true, notifications }
  } catch (error) {
    console.error('Get notifications error:', error)
    return { success: false, error: error.message }
  }
}

// Subscribe to notifications (real-time)
export const subscribeToNotifications = (userId, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    const notifications = []
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() })
    })
    callback(notifications)
  })
}

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    })
    return { success: true }
  } catch (error) {
    console.error('Mark notification read error:', error)
    return { success: false, error: error.message }
  }
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    
    const updatePromises = []
    querySnapshot.forEach((document) => {
      updatePromises.push(
        updateDoc(doc(db, 'notifications', document.id), { read: true })
      )
    })
    
    await Promise.all(updatePromises)
    return { success: true }
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    return { success: false, error: error.message }
  }
}

// Get unread notification count
export const getUnreadCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    )
    
    const querySnapshot = await getDocs(q)
    return { success: true, count: querySnapshot.size }
  } catch (error) {
    console.error('Get unread count error:', error)
    return { success: false, error: error.message }
  }
}