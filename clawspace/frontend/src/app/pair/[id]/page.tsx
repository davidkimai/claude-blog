'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PairView } from '@/components/feature/collaboration/PairView';

export default function PairPage() {
  const params = useParams();
  const pairId = params.id as string;
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // Get current user ID from auth context or localStorage
    // This would be replaced with actual auth logic
    const userId = localStorage.getItem('user_id') || 'demo-user';
    setCurrentUserId(userId);
  }, []);

  if (!pairId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold text-gray-900">Agent Pair</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-[calc(100vh-200px)]">
          <PairView pairId={pairId} currentUserId={currentUserId} />
        </div>
      </main>
    </div>
  );
}
