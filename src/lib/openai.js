import OpenAI from 'openai'

/**
 * OpenAI integration for Dream Weaver
 * Handles AI-powered dream interpretation
 */

const openai = import.meta.env.VITE_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
    })
  : null

// Configuration
const AI_CONFIG = {
  model: 'gpt-4-turbo-preview',
  maxTokens: 1000,
  temperature: 0.7,
  fallbackModel: 'gpt-3.5-turbo'
}

/**
 * Check if OpenAI is configured
 * @returns {boolean} True if OpenAI API key is available
 */
export const isOpenAIConfigured = () => {
  return openai !== null
}

/**
 * Generate dream interpretation using OpenAI
 * @param {string} dreamContent - The dream description
 * @param {Object} context - Additional context (emotions, tags, etc.)
 * @returns {Promise<string>} AI-generated interpretation
 */
export const generateDreamInterpretation = async (dreamContent, context = {}) => {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API is not configured. Please check your API key.')
  }

  if (!dreamContent || dreamContent.trim().length === 0) {
    throw new Error('Dream content is required for interpretation.')
  }

  try {
    const prompt = buildDreamInterpretationPrompt(dreamContent, context)
    
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: getDreamAnalystSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const interpretation = completion.choices[0]?.message?.content
    if (!interpretation) {
      throw new Error('No interpretation generated')
    }

    return interpretation.trim()
  } catch (error) {
    console.error('OpenAI API error:', error)
    
    // Try fallback model if primary model fails
    if (error.code === 'model_not_found' || error.code === 'insufficient_quota') {
      try {
        return await generateDreamInterpretationFallback(dreamContent, context)
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError)
      }
    }
    
    // Handle specific error types
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('AI service is temporarily busy. Please try again in a few moments.')
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('AI service configuration error. Please contact support.')
    }
    
    if (error.code === 'content_filter') {
      throw new Error('Dream content cannot be processed. Please try rephrasing your dream.')
    }
    
    throw new Error('Unable to generate interpretation at this time. Please try again later.')
  }
}

/**
 * Fallback interpretation using GPT-3.5-turbo
 * @param {string} dreamContent - The dream description
 * @param {Object} context - Additional context
 * @returns {Promise<string>} AI-generated interpretation
 */
const generateDreamInterpretationFallback = async (dreamContent, context) => {
  const prompt = buildDreamInterpretationPrompt(dreamContent, context)
  
  const completion = await openai.chat.completions.create({
    model: AI_CONFIG.fallbackModel,
    messages: [
      {
        role: 'system',
        content: getDreamAnalystSystemPrompt()
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: AI_CONFIG.maxTokens,
    temperature: AI_CONFIG.temperature
  })

  const interpretation = completion.choices[0]?.message?.content
  if (!interpretation) {
    throw new Error('No interpretation generated from fallback model')
  }

  return interpretation.trim()
}

/**
 * Build the prompt for dream interpretation
 * @param {string} dreamContent - The dream description
 * @param {Object} context - Additional context
 * @returns {string} Formatted prompt
 */
const buildDreamInterpretationPrompt = (dreamContent, context) => {
  let prompt = `Please analyze and interpret this dream:\n\n"${dreamContent}"\n\n`
  
  if (context.emotions && context.emotions.length > 0) {
    prompt += `Emotions experienced: ${context.emotions.join(', ')}\n`
  }
  
  if (context.tags && context.tags.length > 0) {
    prompt += `Key elements/themes: ${context.tags.join(', ')}\n`
  }
  
  if (context.previousDreams && context.previousDreams.length > 0) {
    prompt += `\nRecent dream patterns: The dreamer has recently had dreams involving ${context.previousDreams.slice(0, 3).join(', ')}\n`
  }
  
  prompt += `\nPlease provide a thoughtful, personalized interpretation that considers:
1. Symbolic meanings of key elements
2. Emotional significance
3. Possible connections to waking life
4. Psychological insights
5. Any recurring patterns or themes

Keep the interpretation insightful but accessible, around 150-200 words.`

  return prompt
}

/**
 * System prompt for the dream analyst AI
 * @returns {string} System prompt
 */
const getDreamAnalystSystemPrompt = () => {
  return `You are an expert dream analyst and psychologist specializing in dream interpretation. You have deep knowledge of:

- Jungian and Freudian dream analysis
- Symbolic interpretation across cultures
- Modern psychological approaches to dreams
- Neuroscience of dreaming
- Common dream archetypes and meanings

Your interpretations should be:
- Thoughtful and nuanced
- Psychologically informed but accessible
- Respectful of the dreamer's personal experience
- Balanced between symbolic and practical insights
- Encouraging of self-reflection

Avoid:
- Overly definitive statements about meaning
- Predictions about the future
- Medical or psychiatric diagnoses
- Cultural stereotypes or assumptions
- Overly mystical or supernatural explanations

Focus on helping the dreamer understand potential meanings and connections to their waking life, while encouraging their own self-discovery process.`
}

/**
 * Generate dream pattern analysis
 * @param {Array} dreams - Array of dream objects
 * @returns {Promise<string>} Pattern analysis
 */
export const generatePatternAnalysis = async (dreams) => {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API is not configured.')
  }

  if (!dreams || dreams.length < 3) {
    throw new Error('At least 3 dreams are required for pattern analysis.')
  }

  try {
    const dreamSummaries = dreams.slice(0, 10).map((dream, index) => 
      `Dream ${index + 1}: ${dream.content.substring(0, 200)}... (Emotions: ${dream.emotions?.join(', ') || 'none'}, Tags: ${dream.tags?.join(', ') || 'none'})`
    ).join('\n\n')

    const prompt = `Analyze the following dreams for patterns, recurring themes, and psychological insights:

${dreamSummaries}

Please provide:
1. Recurring symbols or themes
2. Emotional patterns
3. Possible psychological significance
4. Suggestions for self-reflection
5. Any notable progressions or changes

Keep the analysis insightful and around 250-300 words.`

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: getDreamAnalystSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.6
    })

    const analysis = completion.choices[0]?.message?.content
    if (!analysis) {
      throw new Error('No pattern analysis generated')
    }

    return analysis.trim()
  } catch (error) {
    console.error('Pattern analysis error:', error)
    throw new Error('Unable to generate pattern analysis at this time.')
  }
}

/**
 * Generate personalized dream insights
 * @param {Object} userStats - User's dream statistics
 * @param {Array} recentDreams - Recent dreams
 * @returns {Promise<string>} Personalized insights
 */
export const generatePersonalizedInsights = async (userStats, recentDreams) => {
  if (!isOpenAIConfigured()) {
    throw new Error('OpenAI API is not configured.')
  }

  try {
    const prompt = `Based on this dreamer's statistics and recent dreams, provide personalized insights:

Statistics:
- Total dreams recorded: ${userStats.totalDreams}
- Dreams with interpretations: ${userStats.interpretedDreams}
- Most common emotion: ${userStats.mostCommonEmotion}
- Most common theme: ${userStats.mostCommonTag}
- Dream frequency: ${userStats.averageDreamsPerWeek} per week

Recent dream themes: ${recentDreams.slice(0, 5).map(d => d.tags?.join(', ')).filter(Boolean).join('; ')}

Provide 3-4 personalized insights about their dream patterns, psychological themes, and suggestions for deeper self-understanding. Keep it encouraging and insightful, around 200 words.`

    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [
        {
          role: 'system',
          content: getDreamAnalystSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    })

    const insights = completion.choices[0]?.message?.content
    if (!insights) {
      throw new Error('No insights generated')
    }

    return insights.trim()
  } catch (error) {
    console.error('Insights generation error:', error)
    throw new Error('Unable to generate personalized insights at this time.')
  }
}

/**
 * Mock interpretation for development/fallback
 * @param {string} dreamContent - The dream description
 * @returns {Promise<string>} Mock interpretation
 */
export const generateMockInterpretation = async (dreamContent) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const mockInterpretations = [
    "This dream reflects your desire for freedom and transcendence. Flying often symbolizes rising above challenges and gaining a new perspective on life situations. The mountains represent obstacles you've overcome or are working to overcome.",
    
    "Your subconscious is processing feelings of being overwhelmed or directionless. The maze represents complex decisions or situations where you feel trapped. Consider what areas of your life feel chaotic or uncertain.",
    
    "This dream suggests a need for wisdom and guidance in your current situation. Animals in dreams often represent instinctual knowledge. Your mind is seeking answers to important questions in your waking life.",
    
    "The symbols in your dream point to transformation and personal growth. Water often represents emotions and the unconscious mind. You may be entering a new phase of emotional or spiritual development.",
    
    "This appears to be your mind's way of processing recent experiences and emotions. The recurring elements suggest unresolved feelings or situations that need your attention in waking life."
  ]
  
  // Simple keyword-based selection for more relevant mock responses
  const content = dreamContent.toLowerCase()
  
  if (content.includes('fly') || content.includes('flying') || content.includes('air')) {
    return mockInterpretations[0]
  } else if (content.includes('lost') || content.includes('maze') || content.includes('confused')) {
    return mockInterpretations[1]
  } else if (content.includes('animal') || content.includes('owl') || content.includes('bird')) {
    return mockInterpretations[2]
  } else if (content.includes('water') || content.includes('ocean') || content.includes('river')) {
    return mockInterpretations[3]
  } else {
    return mockInterpretations[4]
  }
}
