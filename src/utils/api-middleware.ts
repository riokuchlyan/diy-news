// Prevents public api routes from being accessed without an api key

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function validateApiRequest(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  // Validate API key
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid API key' },
      { status: 401 }
    )
  }

  // Request is valid
  return null
}

export function isPublicApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/api/send') ||
    pathname.startsWith('/api/openai') ||
    pathname.startsWith('/api/news-api') ||
    pathname.startsWith('/api/newsletter')
  )
} 