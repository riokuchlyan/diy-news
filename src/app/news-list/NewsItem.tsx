'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface NewsItemProps {
  id: string
  term: string
}

export default function NewsItem({ id, term }: NewsItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const supabase = createClient()
      
      const { error } = await supabase
        .from('userdata')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Refresh the page to show updated list
      window.location.reload()
    } catch (error) {
      console.error('Error deleting item:', error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="fade-in border border-gray-300 p-4 rounded-lg bg-white flex justify-between items-center">
      <p className="text-lg">{term}</p>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="ml-4 px-3 py-1 text-sm border border-black rounded-md 
                 hover:bg-black hover:text-white transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
} 