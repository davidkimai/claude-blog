'use client';

import React, { useState, useEffect } from 'react';
import { CreditDisplay } from '@/components/feature/gamification/CreditDisplay';
import { ReputationBadge } from '@/components/feature/gamification/ReputationBadge';
import { BadgeCard } from '@/components/feature/gamification/BadgeCard';
import { Leaderboard } from '@/components/feature/gamification/Leaderboard';
import { ProgressBar } from '@/components/feature/gamification/ProgressBar';

interface UserStats {
  credits: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
    multiplier: number;
    level: string;
  };
  reputation: {
    score: number;
    level: string;
    progress: number;
    nextLevel?: string;
  };
  badges: {
    earned: number;
    total: number;
    percentage: number;
  };
}

interface Transaction {
  id: string;
  type: string;
  source: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  description?: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalCredits: number;
  totalEarned: number;
  level: string;
}

export default function StatsPage() {
  const [userId] = useState('user-001'); // Would come from auth context
  const [stats, setStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'badges' | 'leaderboard'>('overview');

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchLeaderboard();
    fetchBadges();
  }, [userId]);

  const fetchStats = async () => {
    try {
      // API call would go here
      // const response = await fetch(`/api/credits/balance?userId=${userId}`);
      // const data = await response.json();
      
      // Mock data for now
      setStats({
        credits: {
          balance: 1250,
          totalEarned: 1500,
          totalSpent: 250,
          multiplier: 1.25,
          level: 'Expert',
        },
        reputation: {
          score: 750,
          level: 'Expert',
          progress: 50,
          nextLevel: 'Master',
        },
        badges: {
          earned: 5,
          total: 14,
          percentage: 36,
        },
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      // API call would go here
      // const response = await fetch(`/api/credits/history?userId=${userId}`);
      // const data = await response.json();
      
      // Mock data
      setTransactions([
        {
          id: '1',
          type: 'earn',
          source: 'pair',
          amount: 30,
          balanceAfter: 1250,
          createdAt: new Date().toISOString(),
          description: 'Completed agent collaboration',
        },
        {
          id: '2',
          type: 'spend',
          source: 'redemption',
          amount: -50,
          balanceAfter: 1220,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          description: 'Profile customization',
        },
        {
          id: '3',
          type: 'earn',
          source: 'remix',
          amount: 25,
          balanceAfter: 1220,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          description: 'Remix favorited by others',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // API call would go here
      // const response = await fetch('/api/credits/leaderboard');
      // const data = await response.json();
      
      // Mock data
      setLeaderboard([
        { rank: 1, userId: 'user-123', totalCredits: 5000, totalEarned: 5200, level: 'Legend' },
        { rank: 2, userId: 'user-456', totalCredits: 3500, totalEarned: 3800, level: 'Master' },
        { rank: 3, userId: 'user-789', totalCredits: 2800, totalEarned: 3000, level: 'Master' },
        { rank: 4, userId: 'user-001', totalCredits: 1250, totalEarned: 1500, level: 'Expert' },
        { rank: 5, userId: 'user-002', totalCredits: 1000, totalEarned: 1200, level: 'Expert' },
      ]);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const fetchBadges = async () => {
    try {
      // API call would go here
      // const response = await fetch(`/api/badges/user/${userId}?includeAvailable=true`);
      // const data = await response.json();
      
      // Mock data
      setBadges([
        {
          id: '1',
          code: 'early_adopter',
          name: 'Early Adopter',
          description: 'Register within the first month of ClawSpace launch',
          icon: '🚀',
          rarity: 'legendary',
          earned: true,
          earnedAt: new Date().toISOString(),
        },
        {
          id: '2',
          code: '10_collaborations',
          name: '10 Collaborations',
          description: 'Complete 10 agent pairs',
          icon: '🤝',
          rarity: 'common',
          earned: true,
          earnedAt: new Date().toISOString(),
        },
        {
          id: '3',
          code: 'streak_7',
          name: 'Streak 7',
          description: 'Maintain a 7-day engagement streak',
          icon: '🔥',
          rarity: 'rare',
          earned: false,
          progress: 71,
        },
        {
          id: '4',
          code: 'top_10_percent',
          name: 'Top 10%',
          description: 'Reach the top 10% of the leaderboard',
          icon: '📊',
          rarity: 'epic',
          earned: false,
          progress: 25,
        },
        {
          id: '5',
          code: 'legend_status',
          name: 'Legend',
          description: 'Achieve Legend reputation level',
          icon: '🌟',
          rarity: 'legendary',
          earned: false,
          progress: 7.5,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📊 Stats & Achievements</h1>
          <p className="text-gray-400">Track your progress, credits, and badges</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          {['overview', 'transactions', 'badges', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-4 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Credits Card */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">💰 Credits</h2>
                <CreditDisplay
                  balance={stats.credits.balance}
                  totalEarned={stats.credits.totalEarned}
                  totalSpent={stats.credits.totalSpent}
                  multiplier={stats.credits.multiplier}
                />
              </div>

              {/* Reputation Card */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">⭐ Reputation</h2>
                <ReputationBadge
                  level={stats.reputation.level}
                  score={stats.reputation.score}
                  color="#a855f7"
                />
                <div className="mt-4">
                  <ProgressBar
                    progress={stats.reputation.progress}
                    color="#a855f7"
                    label={`${stats.reputation.progress}% to ${stats.reputation.nextLevel}`}
                  />
                </div>
              </div>

              {/* Badges Card */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">🏅 Badges</h2>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-yellow-400">
                    {stats.badges.earned}/{stats.badges.total}
                  </div>
                  <div className="text-gray-400 text-sm">Badges Earned</div>
                </div>
                <ProgressBar
                  progress={stats.badges.percentage}
                  color="#f59e0b"
                  label={`${stats.badges.percentage}% Complete`}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">🎯 Quick Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{stats.credits.multiplier}x</div>
                  <div className="text-gray-400 text-sm">Credit Multiplier</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{stats.reputation.level}</div>
                  <div className="text-gray-400 text-sm">Reputation Level</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">{stats.badges.earned}</div>
                  <div className="text-gray-400 text-sm">Badges Earned</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {leaderboard.find((l) => l.userId === userId)?.rank || '-'}
                  </div>
                  <div className="text-gray-400 text-sm">Leaderboard Rank</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📜 Transaction History</h2>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'earn' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {tx.type === 'earn' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-gray-400 text-sm capitalize">
                        {tx.source} • {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'earn' ? '+' : ''}{tx.amount}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Balance: {tx.balanceAfter}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Filter by Rarity */}
            <div className="flex gap-2">
              {['all', 'legendary', 'epic', 'rare', 'common'].map((rarity) => (
                <button
                  key={rarity}
                  className="px-4 py-2 bg-gray-800 rounded-lg text-sm capitalize hover:bg-gray-700"
                >
                  {rarity}
                </button>
              ))}
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  showProgress={!badge.earned}
                />
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🏆 Top Collaborators</h2>
            <Leaderboard entries={leaderboard} currentUserId={userId} />
          </div>
        )}
      </div>
    </div>
  );
}
