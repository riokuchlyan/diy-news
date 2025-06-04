'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AddNewsItems() {
  const [newsInput, setNewsInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Split the input by commas and trim whitespace
      const newsItems = newsInput.split(',').map(item => item.trim()).filter(Boolean)

      // Insert each news item as a separate row
      const { error: insertError } = await supabase
        .from('userdata')
        .insert(
          newsItems.map(term => ({
            UID: user.id,
            'news-terms': term // Each term gets its own row
          }))
        )

      if (insertError) throw insertError

      // Clear the input on success
      setNewsInput('')
      // Optionally refresh the page or update the list
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add news items')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newsItems" className="block text-sm font-medium mb-2">
            Add News Items (separate by commas)
          </label>
          <textarea
            id="newsItems"
            value={newsInput}
            onChange={(e) => setNewsInput(e.target.value)}
            placeholder="tech news, world news, sports..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            rows={3}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !newsInput.trim()}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add News Items'}
        </button>
      </form>
    </div>
  )
} 