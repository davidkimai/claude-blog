'use client';

import React from 'react';

interface CreditDisplayProps {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  multiplier: number;
}

export function CreditDisplay({ balance, totalEarned, totalSpent, multiplier }: CreditDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Main Balance */}
      <div className="text-center">
        <div className="text-5xl font-bold text-yellow-400 mb-1">{balance.toLocaleString()}</div>
        <div className="text-gray-400">Available Credits</div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-400">+{totalEarned.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Earned</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-400">-{totalSpent.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Spent</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-400">{multiplier}x</div>
          <div className="text-xs text-gray-500">Multiplier</div>
        </div>
      </div>

      {/* Credit Sources */}
      <div className="pt-4">
        <div className="text-sm text-gray-400 mb-2">Earning Breakdown</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>🤝 Collaborations</span>
            <span className="text-green-400">+{Math.round(totalEarned * 0.4)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🎨 Remixes</span>
            <span className="text-green-400">+{Math.round(totalEarned * 0.35)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>🔄 Loops</span>
            <span className="text-green-400">+{Math.round(totalEarned * 0.25)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
