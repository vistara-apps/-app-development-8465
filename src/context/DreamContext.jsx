import React, { createContext, useContext, useState, useEffect } from 'react'

const DreamContext = createContext()

export const useDreamContext = () => {
  const context = useContext(DreamContext)
  if (!context) {
    throw new Error('useDreamContext must be used within a DreamContextProvider')
  }
  return context
}

export const DreamContextProvider = ({ children }) => {
  const [dreams, setDreams] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load dreams from localStorage
    const savedDreams = localStorage.getItem('dreamWeaver_dreams')
    if (savedDreams) {
      setDreams(JSON.parse(savedDreams))
    } else {
      // Add sample dreams for demo
      const sampleDreams = [
        {
          id: '1',
          date: '2024-01-15',
          title: 'Flying Over Mountains',
          content: 'I was soaring high above snow-capped mountains, feeling completely free and weightless. The view was breathtaking, and I could control my flight just by thinking about where I wanted to go.',
          emotions: ['joy', 'freedom', 'peace'],
          tags: ['flying', 'mountains', 'nature'],
          interpretation: null,
          createdAt: new Date('2024-01-15').toISOString()
        },
        {
          id: '2',
          date: '2024-01-12',
          title: 'Lost in a Maze',
          content: 'I found myself in an endless maze made of tall hedges. No matter which direction I turned, I couldn\'t find the exit. I felt increasingly anxious and frustrated.',
          emotions: ['anxiety', 'frustration', 'confusion'],
          tags: ['maze', 'lost', 'anxiety'],
          interpretation: 'This dream often reflects feelings of being overwhelmed or lost in your waking life. The maze represents complex decisions or situations where you feel trapped. The hedges symbolize barriers or obstacles that seem insurmountable.',
          createdAt: new Date('2024-01-12').toISOString()
        },
        {
          id: '3',
          date: '2024-01-10',
          title: 'Talking to a Wise Owl',
          content: 'A large, majestic owl perched on a branch and began speaking to me in a deep, knowing voice. It told me secrets about my future and gave me advice about an important decision I need to make.',
          emotions: ['curiosity', 'wisdom', 'guidance'],
          tags: ['owl', 'wisdom', 'advice', 'nature'],
          interpretation: 'Owls in dreams typically symbolize wisdom, intuition, and insight. This dream suggests you\'re seeking guidance for an important life decision. Your subconscious is telling you to trust your inner wisdom.',
          createdAt: new Date('2024-01-10').toISOString()
        }
      ]
      setDreams(sampleDreams)
      localStorage.setItem('dreamWeaver_dreams', JSON.stringify(sampleDreams))
    }
  }, [])

  const saveDreams = (newDreams) => {
    setDreams(newDreams)
    localStorage.setItem('dreamWeaver_dreams', JSON.stringify(newDreams))
  }

  const addDream = (dreamData) => {
    const newDream = {
      id: Date.now().toString(),
      ...dreamData,
      createdAt: new Date().toISOString()
    }
    const updatedDreams = [newDream, ...dreams]
    saveDreams(updatedDreams)
  }

  const updateDream = (dreamId, updates) => {
    const updatedDreams = dreams.map(dream => 
      dream.id === dreamId ? { ...dream, ...updates } : dream
    )
    saveDreams(updatedDreams)
  }

  const deleteDream = (dreamId) => {
    const updatedDreams = dreams.filter(dream => dream.id !== dreamId)
    saveDreams(updatedDreams)
  }

  const getInterpretation = async (dreamContent) => {
    setIsLoading(true)
    try {
      // Simulate AI interpretation - in production, this would call OpenAI API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const interpretations = [
        "This dream reflects your desire for freedom and transcendence. Flying often symbolizes rising above challenges and gaining a new perspective on life situations.",
        "Your subconscious is processing feelings of being overwhelmed or directionless. Consider what areas of your life feel chaotic or uncertain.",
        "This dream suggests a need for wisdom and guidance in your current situation. Your mind is seeking answers to important questions.",
        "The symbols in your dream point to transformation and personal growth. You may be entering a new phase of life.",
        "This appears to be your mind's way of processing recent experiences and emotions. Pay attention to the feelings that emerged."
      ]
      
      return interpretations[Math.floor(Math.random() * interpretations.length)]
    } catch (error) {
      console.error('Error getting interpretation:', error)
      return "Unable to generate interpretation at this time. Please try again later."
    } finally {
      setIsLoading(false)
    }
  }

  const getDreamPatterns = () => {
    const emotionCounts = {}
    const tagCounts = {}
    const monthlyDreams = {}

    dreams.forEach(dream => {
      // Count emotions
      dream.emotions?.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      })

      // Count tags
      dream.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })

      // Count monthly dreams
      const month = new Date(dream.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyDreams[month] = (monthlyDreams[month] || 0) + 1
    })

    return {
      totalDreams: dreams.length,
      emotionCounts,
      tagCounts,
      monthlyDreams,
      averageDreamsPerWeek: (dreams.length / 4).toFixed(1), // Rough estimate
      mostCommonEmotion: Object.keys(emotionCounts).reduce((a, b) => 
        emotionCounts[a] > emotionCounts[b] ? a : b, 'peace'
      ),
      mostCommonTag: Object.keys(tagCounts).reduce((a, b) => 
        tagCounts[a] > tagCounts[b] ? a : b, 'nature'
      )
    }
  }

  return (
    <DreamContext.Provider value={{
      dreams,
      isLoading,
      addDream,
      updateDream,
      deleteDream,
      getInterpretation,
      getDreamPatterns
    }}>
      {children}
    </DreamContext.Provider>
  )
}