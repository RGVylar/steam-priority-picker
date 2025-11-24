// API utilities for making requests to the backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Preferences API functions
export const preferencesApi = {
  async get() {
    try {
      return await apiRequest('/api/preferences')
    } catch (error) {
      console.warn('Failed to load preferences, using defaults:', error)
      return null
    }
  },

  async update(preferences) {
    try {
      return await apiRequest('/api/preferences', {
        method: 'POST',
        body: JSON.stringify(preferences)
      })
    } catch (error) {
      console.error('Failed to save preferences:', error)
      throw error
    }
  },

  async reset() {
    try {
      return await apiRequest('/api/preferences', {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to reset preferences:', error)
      throw error
    }
  }
}