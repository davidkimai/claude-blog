'use client';

import { useState, useEffect } from 'react';
import { Pattern } from '@/lib/types/modules';
import { PatternCard } from './PatternCard';

interface TrendingPatternsProps {
  limit?: number;
}

export function TrendingPatterns({ limit = 5 }: TrendingPatternsProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch(`/patterns/trending?limit=${limit}`);
        const data = await res.json();
        setPatterns(data);
      } catch (error) {
        console.error('Failed to fetch trending patterns:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, [limit]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % patterns.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + patterns.length) % patterns.length);
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 text-center">
        <p className="text-gray-500">No trending patterns yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">🔥 Trending Patterns</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {patterns.length}
          </span>
          <button
            onClick={nextSlide}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {patterns.map((pattern) => (
            <div key={pattern.id} className="w-full flex-shrink-0">
              <PatternCard
                pattern={pattern}
                onAdopt={(id) => console.log('Adopt pattern:', id)}
                onViewDetails={(id) => console.log('View details:', id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {patterns.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
