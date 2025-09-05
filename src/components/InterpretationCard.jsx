import React from 'react'
import { Sparkles, Brain, Heart, Eye } from 'lucide-react'

export const InterpretationCard = ({ interpretation }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-500/20">
      <div className="flex items-center space-x-2 mb-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-400" />
        </div>
        <h4 className="text-lg font-semibold text-white">AI Dream Interpretation</h4>
      </div>
      
      <div className="text-gray-300 leading-relaxed">
        <p>{interpretation}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            <Brain className="w-3 h-3" />
            <span>Symbolic Analysis</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-3 h-3" />
            <span>Emotional Context</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>Personal Insights</span>
          </div>
        </div>
      </div>
    </div>
  )
}