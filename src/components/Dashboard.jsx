import React, { useState } from 'react'
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  Heart,
  BarChart3,
  PieChart,
  Clock,
  Sparkles,
  Crown
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts'
import { useDreamContext } from '../context/DreamContext'
import { SubscriptionModal } from './SubscriptionModal'

export const Dashboard = ({ user }) => {
  const { dreams, getDreamPatterns } = useDreamContext()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const patterns = getDreamPatterns()

  // Sample data for charts
  const dreamTrendData = [
    { month: 'Oct', dreams: 8, interpretations: 3 },
    { month: 'Nov', dreams: 12, interpretations: 7 },
    { month: 'Dec', dreams: 15, interpretations: 12 },
    { month: 'Jan', dreams: 18, interpretations: 15 },
  ]

  const emotionData = Object.entries(patterns.emotionCounts).map(([emotion, count]) => ({
    name: emotion,
    value: count,
    color: {
      joy: '#10B981',
      peace: '#3B82F6',
      anxiety: '#EF4444',
      confusion: '#F59E0B',
      wisdom: '#8B5CF6',
      freedom: '#06B6D4',
      frustration: '#EF4444',
      curiosity: '#F59E0B',
      guidance: '#8B5CF6'
    }[emotion] || '#6B7280'
  }))

  const tagData = Object.entries(patterns.tagCounts).slice(0, 6).map(([tag, count]) => ({
    tag,
    count
  }))

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, isPremium = false }) => (
    <div className="glass-card rounded-xl p-6 relative overflow-hidden">
      {isPremium && user?.subscriptionTier === 'free' && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-purple-600/20 backdrop-blur-sm flex items-center justify-center">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end">
          <Icon className="w-8 h-8 text-blue-400 mb-2" />
          {trend && (
            <div className="flex items-center space-x-1 text-green-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const ChartCard = ({ title, children, isPremium = false }) => (
    <div className="glass-card rounded-xl p-6 relative">
      {isPremium && user?.subscriptionTier === 'free' && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-purple-600/20 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade for Advanced Analytics</span>
          </button>
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="gradient-bg rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100">
              You've recorded {patterns.totalDreams} dreams. Ready to explore your subconscious?
            </p>
          </div>
          <Sparkles className="w-12 h-12 text-yellow-300" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Dreams"
          value={patterns.totalDreams}
          subtitle="This month"
          icon={Brain}
          trend="+23%"
        />
        <StatCard
          title="Interpretations"
          value={dreams.filter(d => d.interpretation).length}
          subtitle="AI analyzed"
          icon={Sparkles}
          trend="+15%"
          isPremium={user?.subscriptionTier === 'free'}
        />
        <StatCard
          title="Dream Frequency"
          value={`${patterns.averageDreamsPerWeek}/week`}
          subtitle="Average"
          icon={Calendar}
          isPremium={user?.subscriptionTier === 'free'}
        />
        <StatCard
          title="Dominant Emotion"
          value={patterns.mostCommonEmotion}
          subtitle="Most frequent"
          icon={Heart}
          isPremium={user?.subscriptionTier === 'free'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dream Trends */}
        <ChartCard title="Dream Activity Trends">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dreamTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="dreams" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="interpretations" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Emotion Distribution */}
        <ChartCard title="Emotional Patterns" isPremium={user?.subscriptionTier === 'free'}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Common Dream Themes */}
        <ChartCard title="Common Dream Themes" isPremium={user?.subscriptionTier === 'free'}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="tag" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Quick Insights */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-400" />
            Quick Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white text-sm font-medium">Most Active Dream Period</p>
                <p className="text-gray-400 text-xs">You tend to remember more dreams on weekends</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white text-sm font-medium">Recurring Symbol</p>
                <p className="text-gray-400 text-xs">"{patterns.mostCommonTag}" appears in 60% of your dreams</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white text-sm font-medium">Dream Quality</p>
                <p className="text-gray-400 text-xs">Your dreams show increasing emotional depth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Dreams Preview */}
      <ChartCard title="Recent Dreams">
        <div className="space-y-3">
          {dreams.slice(0, 3).map((dream) => (
            <div key={dream.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">{dream.title}</p>
                <p className="text-gray-400 text-sm">{new Date(dream.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                {dream.interpretation && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

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