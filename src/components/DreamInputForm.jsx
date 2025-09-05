import React, { useState, useEffect } from 'react'
import { Save, X, Calendar, Tag, Heart, Plus, Minus } from 'lucide-react'
import { useDreamContext } from '../context/DreamContext'

export const DreamInputForm = ({ dream, onSave, onCancel }) => {
  const { addDream, updateDream } = useDreamContext()
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    emotions: [],
    tags: []
  })
  const [newEmotion, setNewEmotion] = useState('')
  const [newTag, setNewTag] = useState('')

  const commonEmotions = [
    'joy', 'peace', 'anxiety', 'confusion', 'wisdom', 'freedom', 
    'frustration', 'curiosity', 'guidance', 'fear', 'love', 'excitement'
  ]

  const commonTags = [
    'flying', 'water', 'animals', 'family', 'work', 'school', 
    'nature', 'house', 'driving', 'falling', 'chasing', 'magic'
  ]

  useEffect(() => {
    if (dream) {
      setFormData({
        title: dream.title || '',
        date: dream.date || new Date().toISOString().split('T')[0],
        content: dream.content || '',
        emotions: dream.emotions || [],
        tags: dream.tags || []
      })
    }
  }, [dream])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both title and dream content')
      return
    }

    if (dream) {
      updateDream(dream.id, formData)
    } else {
      addDream(formData)
    }
    
    onSave()
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addEmotion = (emotion) => {
    if (!formData.emotions.includes(emotion)) {
      setFormData({
        ...formData,
        emotions: [...formData.emotions, emotion]
      })
    }
    setNewEmotion('')
  }

  const removeEmotion = (emotion) => {
    setFormData({
      ...formData,
      emotions: formData.emotions.filter(e => e !== emotion)
    })
  }

  const addTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      })
    }
    setNewTag('')
  }

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  const handleAddCustomEmotion = () => {
    if (newEmotion.trim()) {
      addEmotion(newEmotion.trim().toLowerCase())
    }
  }

  const handleAddCustomTag = () => {
    if (newTag.trim()) {
      addTag(newTag.trim().toLowerCase())
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {dream ? 'Edit Dream' : 'Record New Dream'}
        </h1>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Dream Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Dream Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Give your dream a memorable title..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Dream Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Dream Description
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={8}
              placeholder="Describe your dream in as much detail as you can remember. Include locations, people, objects, actions, and feelings..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              required
            />
            <p className="text-xs text-gray-400 mt-2">
              Tip: The more details you provide, the better the AI interpretation will be.
            </p>
          </div>
        </div>

        {/* Emotions */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-400" />
            Emotions
          </h2>
          
          {/* Selected Emotions */}
          {formData.emotions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">Selected emotions:</p>
              <div className="flex flex-wrap gap-2">
                {formData.emotions.map((emotion) => (
                  <span
                    key={emotion}
                    className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-full"
                  >
                    {emotion}
                    <button
                      type="button"
                      onClick={() => removeEmotion(emotion)}
                      className="ml-2 hover:text-red-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common Emotions */}
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">Common emotions:</p>
            <div className="flex flex-wrap gap-2">
              {commonEmotions.map((emotion) => (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => addEmotion(emotion)}
                  disabled={formData.emotions.includes(emotion)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    formData.emotions.includes(emotion)
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Emotion */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newEmotion}
              onChange={(e) => setNewEmotion(e.target.value)}
              placeholder="Add custom emotion..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomEmotion())}
            />
            <button
              type="button"
              onClick={handleAddCustomEmotion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-purple-400" />
            Tags
          </h2>
          
          {/* Selected Tags */}
          {formData.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">Selected tags:</p>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-purple-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Common Tags */}
          <div className="mb-4">
            <p className="text-sm text-gray-300 mb-2">Common dream elements:</p>
            <div className="flex flex-wrap gap-2">
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={formData.tags.includes(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tag */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag..."
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{dream ? 'Update Dream' : 'Save Dream'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}