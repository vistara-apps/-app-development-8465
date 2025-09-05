import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Tag,
  Heart,
  Sparkles,
  Edit,
  Trash2,
  ChevronDown,
  Crown
} from 'lucide-react'
import { useDreamContext } from '../context/DreamContext'
import { DreamInputForm } from './DreamInputForm'
import { InterpretationCard } from './InterpretationCard'
import { SubscriptionModal } from './SubscriptionModal'

export const DreamJournal = ({ user }) => {
  const { dreams, deleteDream, getInterpretation, updateDream, isLoading } = useDreamContext()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingDream, setEditingDream] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [expandedDream, setExpandedDream] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Get unique emotions and tags for filters
  const allEmotions = [...new Set(dreams.flatMap(dream => dream.emotions || []))]
  const allTags = [...new Set(dreams.flatMap(dream => dream.tags || []))]

  // Filter dreams
  const filteredDreams = dreams.filter(dream => {
    const matchesSearch = dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dream.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEmotion = !selectedEmotion || dream.emotions?.includes(selectedEmotion)
    const matchesTag = !selectedTag || dream.tags?.includes(selectedTag)
    
    return matchesSearch && matchesEmotion && matchesTag
  })

  const handleGetInterpretation = async (dreamId) => {
    // Check subscription limits
    if (user?.subscriptionTier === 'free') {
      const interpretedDreams = dreams.filter(d => d.interpretation).length
      if (interpretedDreams >= 3) {
        setShowUpgradeModal(true)
        return
      }
    }

    const dream = dreams.find(d => d.id === dreamId)
    if (!dream) return

    try {
      const interpretation = await getInterpretation(dream.content)
      updateDream(dreamId, { interpretation })
    } catch (error) {
      console.error('Failed to get interpretation:', error)
    }
  }

  const handleDeleteDream = (dreamId) => {
    if (window.confirm('Are you sure you want to delete this dream?')) {
      deleteDream(dreamId)
    }
  }

  const EmotionTag = ({ emotion, onClick }) => (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
        selectedEmotion === emotion
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      <Heart className="w-3 h-3 mr-1" />
      {emotion}
    </span>
  )

  const DreamTag = ({ tag, onClick }) => (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
        selectedTag === tag
          ? 'bg-purple-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      <Tag className="w-3 h-3 mr-1" />
      {tag}
    </span>
  )

  const DreamCard = ({ dream }) => {
    const isExpanded = expandedDream === dream.id
    
    return (
      <div className="glass-card rounded-xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{dream.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(dream.date).toLocaleDateString()}</span>
              </div>
              {dream.interpretation && (
                <div className="flex items-center space-x-1 text-green-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Interpreted</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingDream(dream)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteDream(dream.id)}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpandedDream(isExpanded ? null : dream.id)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="text-gray-300">
          <p className={`${isExpanded ? '' : 'line-clamp-2'}`}>
            {dream.content}
          </p>
        </div>

        {/* Tags and Emotions */}
        <div className="space-y-2">
          {dream.emotions && dream.emotions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dream.emotions.map((emotion, index) => (
                <EmotionTag 
                  key={index} 
                  emotion={emotion} 
                  onClick={() => setSelectedEmotion(selectedEmotion === emotion ? '' : emotion)}
                />
              ))}
            </div>
          )}
          
          {dream.tags && dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dream.tags.map((tag, index) => (
                <DreamTag 
                  key={index} 
                  tag={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Interpretation Section */}
        {isExpanded && (
          <div className="pt-4 border-t border-gray-700">
            {dream.interpretation ? (
              <InterpretationCard interpretation={dream.interpretation} />
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-3">No interpretation yet</p>
                <button
                  onClick={() => handleGetInterpretation(dream.id)}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isLoading ? 'Analyzing...' : 'Get AI Interpretation'}</span>
                </button>
                {user?.subscriptionTier === 'free' && (
                  <p className="text-xs text-yellow-400 mt-2">
                    Free tier: {3 - dreams.filter(d => d.interpretation).length} interpretations remaining
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (showAddForm || editingDream) {
    return (
      <DreamInputForm
        dream={editingDream}
        onSave={() => {
          setShowAddForm(false)
          setEditingDream(null)
        }}
        onCancel={() => {
          setShowAddForm(false)
          setEditingDream(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Dream Journal</h1>
          <p className="text-gray-400">
            {filteredDreams.length} {filteredDreams.length === 1 ? 'dream' : 'dreams'} recorded
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Dream</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-card rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search dreams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Emotion Filter */}
          <select
            value={selectedEmotion}
            onChange={(e) => setSelectedEmotion(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Emotions</option>
            {allEmotions.map(emotion => (
              <option key={emotion} value={emotion}>{emotion}</option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        {/* Active Filters */}
        {(selectedEmotion || selectedTag || searchTerm) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                Search: {searchTerm}
              </span>
            )}
            {selectedEmotion && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                Emotion: {selectedEmotion}
              </span>
            )}
            {selectedTag && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                Tag: {selectedTag}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedEmotion('')
                setSelectedTag('')
              }}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Dream List */}
      {filteredDreams.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {dreams.length === 0 ? 'No dreams yet' : 'No dreams match your filters'}
          </h3>
          <p className="text-gray-400 mb-6">
            {dreams.length === 0 
              ? 'Start by recording your first dream experience'
              : 'Try adjusting your search criteria'
            }
          </p>
          {dreams.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Record Your First Dream</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDreams.map((dream) => (
            <DreamCard key={dream.id} dream={dream} />
          ))}
        </div>
      )}

      {/* Subscription Modal */}
      {showUpgradeModal && (
        <SubscriptionModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentTier={user?.subscriptionTier}
        />
      )}
    </div>
  )
}