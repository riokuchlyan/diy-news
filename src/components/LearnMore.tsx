'use client'

import { useState } from "react";

export default function LearnMore() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-center w-full">
        One newsletter for everything.
      </p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-gray-600 hover:text-gray-800 transition-colors text-center"
      >
        Learn more {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && (
        <p className="text-center max-w-md text-gray-600 text-sm mt-2">
          A custom newsletter to replace the clutter of multiple email newsletter subscriptions. Solves the problem of inbox spam by letting you choose exactly what you want to see, all in one simple, personalized newsletter.
        </p>
      )}
    </div>
  );
} 