'use client'

import { useState } from "react";

export default function LearnMore() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-center w-full text-white text-glow text-lg">
        One newsletter for everything.
      </p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-gray-400 hover:text-white hover:text-glow transition-all duration-300 text-center transform hover:scale-105"
      >
        Learn more {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && (
        <p className="text-center max-w-md text-gray-400 text-sm mt-2 animate-fade-in">
          A custom newsletter to replace the clutter of multiple email newsletter subscriptions. Choose exactly what you want to see in one simple, personalized newsletter.
        </p>
      )}
    </div>
  );
} 