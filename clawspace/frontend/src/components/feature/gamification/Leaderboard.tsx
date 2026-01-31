'use client';

import React from 'react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalCredits: number;
  totalEarned: number;
  level: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const levelColors: Record<string, string> = {
  Novice: 'text-green-400',
  Active: 'text-blue-400',
  Expert: 'text-purple-400',
  Master: 'text-yellow-400',
  Legend: 'text-orange-400',
};

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isCurrentUser = entry.userId === currentUserId;
        const rankEmoji = entry.rank <= 10 ? rankEmojis[entry.rank - 1] : `#${entry.rank}`;

        return (
          <div
            key={entry.userId}
            className={`flex items-center justify-between p-4 rounded-lg ${
              isCurrentUser
                ? 'bg-blue-500/20 border border-blue-500'
                : 'bg-gray-700 hover:bg-gray-600'
            } transition-colors`}
          >
            {/* Rank */}
            <div className="flex items-center gap-4">
              <div className="text-2xl w-10 text-center">
                {entry.rank <= 3 ? rankEmojis[entry.rank - 1] : entry.rank}
              </div>

              {/* User Info */}
              <div>
                <div className="font-semibold">
                  {isCurrentUser ? 'You' : `User ${entry.userId.slice(-4)}`}
                </div>
                <div className={`text-sm ${levelColors[entry.level] || 'text-gray-400'}`}>
                  {entry.level}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="font-bold text-yellow-400">
                {entry.totalCredits.toLocaleString()} credits
              </div>
              <div className="text-xs text-gray-400">
                +{entry.totalEarned.toLocaleString()} earned
              </div>
            </div>
          </div>
        );
      })}

      {/* Your Position */}
      <div className="pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 text-center">
          Your Position:{' '}
          <span className="text-white font-semibold">
            #{entries.find((e) => e.userId === currentUserId)?.rank || '-'}
          </span>{' '}
          of {entries.length} users
        </div>
      </div>
    </div>
  );
}
