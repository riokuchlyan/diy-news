'use client'

import { login, signup } from '@/app/login/actions'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/news-list')
      }
    }
    checkUser()
  }, [router])

  const handleSignup = async (formData: FormData) => {
    const result = await signup(formData)
    if (result?.success) {
      alert('Please check your email for a confirmation link to complete your registration!')
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            Welcome to DIY News
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your account or create a new one
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-gray-900 p-8 rounded-lg shadow-md border border-gray-700">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-white focus:border-white 
                         bg-gray-800 text-white placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-white focus:border-white 
                         bg-gray-800 text-white placeholder-gray-400"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <div className="flex flex-row space-x-3">
            <button
              formAction={login}
              className="w-full flex justify-center py-2 px-4 border border-white rounded-md shadow-sm text-sm font-medium 
                       text-black bg-white hover:bg-gray-200 
                       focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            >
              Sign in
            </button>
            <button
              formAction={handleSignup}
              className="w-full flex justify-center py-2 px-4 border border-white rounded-md shadow-sm text-sm font-medium 
                       text-white bg-transparent hover:bg-gray-800 
                       focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            >
              Create account
            </button>
            </div>
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-white rounded-md shadow-sm text-sm font-medium 
                       text-white bg-transparent hover:bg-gray-800 
                       focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            >
              Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}