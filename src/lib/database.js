import { supabase, TABLES, handleSupabaseError, isSupabaseConfigured } from './supabase'
import { encryptData, decryptData } from './encryption'

/**
 * Database abstraction layer for Dream Weaver
 * Handles both Supabase and localStorage fallback
 */

class DatabaseService {
  constructor() {
    this.useSupabase = isSupabaseConfigured()
    this.localStorageKeys = {
      users: 'dreamWeaver_user',
      dreams: 'dreamWeaver_dreams'
    }
  }

  // User Management
  async createUser(userData) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .insert([{
            email: userData.email,
            privy_user_id: userData.privyUserId,
            subscription_tier: userData.subscriptionTier || 'free'
          }])
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        handleSupabaseError(error)
      }
    } else {
      // localStorage fallback
      const user = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(this.localStorageKeys.users, JSON.stringify(user))
      return user
    }
  }

  async getUserByPrivyId(privyUserId) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .eq('privy_user_id', privyUserId)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        return data
      } catch (error) {
        handleSupabaseError(error)
      }
    } else {
      // localStorage fallback
      const userData = localStorage.getItem(this.localStorageKeys.users)
      return userData ? JSON.parse(userData) : null
    }
  }

  async updateUser(userId, updates) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from(TABLES.USERS)
          .update(updates)
          .eq('id', userId)
          .select()
          .single()

        if (error) throw error
        return data
      } catch (error) {
        handleSupabaseError(error)
      }
    } else {
      // localStorage fallback
      const userData = localStorage.getItem(this.localStorageKeys.users)
      if (userData) {
        const user = JSON.parse(userData)
        const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() }
        localStorage.setItem(this.localStorageKeys.users, JSON.stringify(updatedUser))
        return updatedUser
      }
      return null
    }
  }

  // Dream Management
  async createDream(dreamData, encryptionKey) {
    const encryptedDream = {
      user_id: dreamData.userId,
      dream_date: dreamData.date,
      dream_text: encryptData(dreamData.content, encryptionKey),
      tags: dreamData.tags ? dreamData.tags.map(tag => encryptData(tag, encryptionKey)) : [],
      emotions: dreamData.emotions ? dreamData.emotions.map(emotion => encryptData(emotion, encryptionKey)) : []
    }

    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from(TABLES.DREAM_ENTRIES)
          .insert([encryptedDream])
          .select()
          .single()

        if (error) throw error
        return this.decryptDreamEntry(data, encryptionKey)
      } catch (error) {
        handleSupabaseError(error)
      }
    } else {
      // localStorage fallback
      const dreams = this.getLocalDreams()
      const newDream = {
        id: Date.now().toString(),
        ...dreamData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      dreams.unshift(newDream)
      localStorage.setItem(this.localStorageKeys.dreams, JSON.stringify(dreams))
      return newDream
    }
  }

  async getDreams(userId, encryptionKey) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from(TABLES.DREAM_ENTRIES)
          .select('*')
          .eq('user_id', userId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data.map(dream => this.decryptDreamEntry(dream, encryptionKey))
      } catch (error) {
        handleSupabaseError(error)
      }
    } else {
      // localStorage fallback
      return this.getLocalDreams()
    }
  }

  async updateDream(dreamId, updates, encryptionKey) {
    const encryptedUpdates = {}
    
    if (updates.content) {
      encryptedUpdates.dream_text = encryptData(updates.content, encryptionKey)
    }
    if (updates.interpretation) {
      encryptedUpdates.interpretation = encryptData(updates.interpretation, encryptionKey)
    }
    if (updates.tags) {
      encryptedUpdates.tags = updates.tags.map(tag => encryptData(tag, encryptionKey))
    }
    if (updates.emotions) {
      encryptedUpdates.emotions = updates.emotions.map(emotion => encryptData(emotion, encryptionKey))
    }
    if (updates.date) {
      encryptedUpdates.dream_date = updates.date
    }

    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from(TABLES.DREAM_ENTRIES)
          .update(encryptedUpdates)
          .eq('id', dreamId)
          .select()
          .single()

        if (error) throw error
        return this.decryptDreamEntry(data, encryptionKey)
      } catch (error) {
        handleSupabaseError(error)
      }
    } else {
      // localStorage fallback
      const dreams = this.getLocalDreams()
      const dreamIndex = dreams.findIndex(dream => dream.id === dreamId)
      if (dreamIndex !== -1) {
        dreams[dreamIndex] = { 
          ...dreams[dreamIndex], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        }
        localStorage.setItem(this.localStorageKeys.dreams, JSON.stringify(dreams))
        return dreams[dreamIndex]
      }
      return null
    }
  }

  async deleteDream(dreamId) {
    if (this.useSupabase) {
      try {
        const { error } = await supabase
          .from(TABLES.DREAM_ENTRIES)
          .update({ is_deleted: true })
          .eq('id', dreamId)

        if (error) throw error
        return true
      } catch (error) {
        handleSupabaseError(error)
      }
    } else {
      // localStorage fallback
      const dreams = this.getLocalDreams()
      const filteredDreams = dreams.filter(dream => dream.id !== dreamId)
      localStorage.setItem(this.localStorageKeys.dreams, JSON.stringify(filteredDreams))
      return true
    }
  }

  async getUserStats(userId) {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .rpc('get_user_stats', { user_uuid: userId })

        if (error) throw error
        return data
      } catch (error) {
        handleSupabaseError(error)
      }
    } else {
      // localStorage fallback
      const dreams = this.getLocalDreams()
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()))

      return {
        total_dreams: dreams.length,
        dreams_with_interpretation: dreams.filter(d => d.interpretation).length,
        dreams_this_month: dreams.filter(d => new Date(d.createdAt) >= thisMonth).length,
        dreams_this_week: dreams.filter(d => new Date(d.createdAt) >= thisWeek).length,
        oldest_dream: dreams.length > 0 ? Math.min(...dreams.map(d => new Date(d.date))) : null,
        newest_dream: dreams.length > 0 ? Math.max(...dreams.map(d => new Date(d.date))) : null
      }
    }
  }

  // Helper methods
  getLocalDreams() {
    const dreams = localStorage.getItem(this.localStorageKeys.dreams)
    return dreams ? JSON.parse(dreams) : []
  }

  decryptDreamEntry(encryptedDream, encryptionKey) {
    try {
      return {
        id: encryptedDream.id,
        userId: encryptedDream.user_id,
        date: encryptedDream.dream_date,
        content: decryptData(encryptedDream.dream_text, encryptionKey),
        interpretation: encryptedDream.interpretation ? decryptData(encryptedDream.interpretation, encryptionKey) : null,
        tags: encryptedDream.tags ? encryptedDream.tags.map(tag => decryptData(tag, encryptionKey)) : [],
        emotions: encryptedDream.emotions ? encryptedDream.emotions.map(emotion => decryptData(emotion, encryptionKey)) : [],
        createdAt: encryptedDream.created_at,
        updatedAt: encryptedDream.updated_at
      }
    } catch (error) {
      console.error('Failed to decrypt dream entry:', error)
      throw new Error('Failed to decrypt dream data. Your encryption key may be invalid.')
    }
  }

  // Migration helper
  async migrateFromLocalStorage(userId, encryptionKey) {
    if (!this.useSupabase) return false

    const localDreams = this.getLocalDreams()
    if (localDreams.length === 0) return true

    try {
      for (const dream of localDreams) {
        await this.createDream({
          userId,
          date: dream.date,
          content: dream.content,
          tags: dream.tags,
          emotions: dream.emotions
        }, encryptionKey)

        // If dream has interpretation, update it
        if (dream.interpretation) {
          const createdDream = await this.getDreams(userId, encryptionKey)
          const latestDream = createdDream[0]
          await this.updateDream(latestDream.id, {
            interpretation: dream.interpretation
          }, encryptionKey)
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(this.localStorageKeys.dreams)
      return true
    } catch (error) {
      console.error('Migration failed:', error)
      return false
    }
  }
}

export const db = new DatabaseService()
