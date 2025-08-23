'use client'

import Image from "next/image";
import Link from "next/link";
import LogoutButton from '@/components/logoutButton'
import LearnMore from '@/components/LearnMore'
import FloatingWordsBackground from '@/components/FloatingWordsBackground'

export default function Home() {
  return (
    <>
      <FloatingWordsBackground />
      <div className="fade-in grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-20 sm:p-20">
      <main className="flex flex-col gap-[40px] row-start-2 items-center sm:items-start">
        <h1 className="text-8xl font-semibold text-center text-white text-glow-strong tracking-wider">DIY NEWS</h1>
        <LearnMore />
      </main>
      <footer className="row-start-3 flex flex-col gap-[12px] items-center justify-center">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-white hover:text-glow transition-all duration-300 transform hover:scale-105"
          href="/login"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
          Login / Sign up
        </Link>
        <LogoutButton />
      </footer>
      </div>
    </>
  );
}
