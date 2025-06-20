import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import { validateApiRequest, isPublicApiRoute } from '@/utils/api-middleware'

export async function middleware(request: NextRequest) {
  // Check if this is a public API route that needs API key validation
  if (isPublicApiRoute(request.nextUrl.pathname)) {
    const validationResponse = await validateApiRequest(request)
    if (validationResponse) {
      return validationResponse
    }
  }

  // Allow requests from the Vercel deployment domain and localhost
  const host = request.headers.get('host')
  if (host === process.env.HOST_URL || host === 'localhost:3000') {
    return NextResponse.next()
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}