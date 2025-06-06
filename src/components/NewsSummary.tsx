'use client'

import { getOpenAIResponse } from '@/utils/getOpenAIResponse';
import { useEffect, useState } from 'react';

interface NewsSummaryProps {
  term: string;
}

export const NewsSummary: React.FC<NewsSummaryProps> = ({ term }) => {
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    const fetchSummary = async () => {
      const response = await getOpenAIResponse(term);
      setSummary(response);
    };
    fetchSummary();
  }, [term]);

  return <p>{summary || 'Loading summary...'}</p>;
}; 