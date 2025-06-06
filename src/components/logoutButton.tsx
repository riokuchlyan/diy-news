import { useState } from "react"
import { createClient } from "../utils/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-600"
      >
        <Image
          aria-hidden
          src="/globe.svg"
          alt="Globe icon"
          width={16}
          height={16}
        />
        {isLoggingOut ? 'Logging out...' : 'Log out'}
      </button>
    </div>
  )
}