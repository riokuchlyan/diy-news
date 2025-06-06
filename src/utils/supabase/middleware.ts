import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { validateApiRequest, isPublicApiRoute } from '../api-middleware'

export async function updateSession(request: NextRequest) {
  // Allow cron route without any checks 
  if (request.nextUrl.pathname.startsWith('/api/cron/')) {
    return NextResponse.next();
  }

  // Check if this is a public API route that needs API key validation
  if (isPublicApiRoute(request.nextUrl.pathname)) {
    const validationResponse = await validateApiRequest(request)
    if (validationResponse) {
      return validationResponse
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            if (options) {
              supabaseResponse.cookies.set(name, value, options)
            } else {
              supabaseResponse.cookies.set(name, value)
            }
          })
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to the root page and public routes without authentication
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api/send') && // Allow /api/send route
    !request.nextUrl.pathname.startsWith('/api/openai') && // Allow /api/openai route
    !request.nextUrl.pathname.startsWith('/api/news-api') && // Allow /api/news-api route
    !request.nextUrl.pathname.startsWith('/api/newsletter') && // Allow /api/newsletter route
    !request.nextUrl.pathname.startsWith('/api/cron/') && // Allow /api/cron/ route
    request.nextUrl.pathname !== '/' &&  // Allow root page
    !request.nextUrl.pathname.startsWith('/public') // Allow other public routes if needed
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}