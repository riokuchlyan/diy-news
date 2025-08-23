'use client';

import { useEffect, useState } from 'react';

const newsTerms = [
  'Artificial Intelligence',
  'Politics',
  'Technology',
  'Economy',
  'Climate Change',
  'Healthcare',
  'Business',
  'Sports',
  'Entertainment',
  'Science',
  'World News',
  'Breaking News',
  'Innovation',
  'Finance',
  'Education',
  'Culture',
  'Society',
  'Environment',
  'Transportation',
  'Energy',
  'Space',
  'Research',
  'Development',
  'Global',
  'Local',
  'International',
  'National',
  'Regional',
  'Analysis',
  'Investigation',
  'Cybersecurity',
  'Blockchain',
  'Quantum Computing',
  'Biotechnology',
  'Renewable Energy',
  'Social Media',
  'Machine Learning',
  'Cryptocurrency',
  'Sustainability',
  'Digital Privacy'
];

interface FloatingWord {
  id: number;
  text: string;
  top: number;
  duration: number;
  delay: number;
  fontSize: number;
  opacity: number;
}

export default function FloatingWordsBackground() {
  const [words, setWords] = useState<FloatingWord[]>([]);

  useEffect(() => {
    const createFloatingWords = () => {
      const newWords: FloatingWord[] = [];
      
      for (let i = 0; i < 15; i++) {
        const duration = 15 + Math.random() * 10; // 15-25 seconds
        // Spread words across the screen width by starting them at different positions
        const initialProgress = Math.random(); // 0-1 representing how far along the animation they start
        
        newWords.push({
          id: i,
          text: newsTerms[Math.floor(Math.random() * newsTerms.length)],
          top: Math.random() * 100,
          duration,
          delay: -(duration * initialProgress), // Negative delay to start partway through animation
          fontSize: 14 + Math.random() * 8, // 14-22px
          opacity: 0.1 + Math.random() * 0.2, // 0.1-0.3 opacity
        });
      }
      
      setWords(newWords);
    };

    createFloatingWords();
    
    // Refresh words every 30 seconds
    const interval = setInterval(createFloatingWords, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      {words.map((word) => (
        <div
          key={word.id}
          className="absolute whitespace-nowrap text-white font-mono select-none"
          style={{
            top: `${word.top}%`,
            fontSize: `${word.fontSize}px`,
            opacity: word.opacity,
            animation: `floatRight ${word.duration}s linear infinite`,
            animationDelay: `${word.delay}s`,
            textShadow: `0 0 ${word.fontSize * 0.3}px rgba(255, 255, 255, 0.2)`,
            filter: 'blur(0.3px)',
          }}
        >
          {word.text}
        </div>
      ))}
      
      <style jsx global>{`
        @keyframes floatRight {
          from {
            transform: translateX(-100px);
          }
          to {
            transform: translateX(calc(100vw + 100px));
          }
        }
      `}</style>
    </div>
  );
}
