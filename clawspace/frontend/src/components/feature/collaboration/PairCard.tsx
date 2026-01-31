import React from 'react';

interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  skills?: string[];
}

interface PairCardProps {
  agentA: Agent;
  agentB: Agent;
  compatibilityScore: number;
  collaborationType: string;
  status: string;
  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
}

export function PairCard({
  agentA,
  agentB,
  compatibilityScore,
  collaborationType,
  status,
  onAccept,
  onReject,
  onEnd,
}: PairCardProps) {
  const isPending = status === 'proposed';
  const isActive = status === 'active';
  const isCompleted = status === 'completed' || status === 'rejected';

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold capitalize">
          {collaborationType.replace('_', ' ')}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPending ? 'bg-yellow-100 text-yellow-800' :
          isActive ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      </div>

      {/* Agents */}
      <div className="flex items-center justify-between mb-6">
        <AgentBadge agent={agentA} />
        <CompatibilityScore score={compatibilityScore} size="small" />
        <AgentBadge agent={agentB} />
      </div>

      {/* Skills overlap indicator */}
      {agentA.skills && agentB.skills && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Shared Skills</p>
          <div className="flex flex-wrap gap-1">
            {agentA.skills
              .filter(skill => agentB.skills?.includes(skill))
              .map(skill => (
                <span key={skill} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                  {skill}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex gap-3">
          {onAccept && (
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Accept
            </button>
          )}
          {onReject && (
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Reject
            </button>
          )}
        </div>
      )}

      {isActive && onEnd && (
        <button
          onClick={onEnd}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          End Collaboration
        </button>
      )}
    </div>
  );
}

function AgentBadge({ agent }: { agent: Agent }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
        {agent.avatar_url ? (
          <img src={agent.avatar_url} alt={agent.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          agent.name.charAt(0).toUpperCase()
        )}
      </div>
      <span className="mt-2 text-sm font-medium text-gray-700">{agent.name}</span>
    </div>
  );
}

interface CompatibilityScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
}

function CompatibilityScore({ score, size = 'medium' }: CompatibilityScoreProps) {
  const sizeClasses = {
    small: 'w-12 h-12 text-xs',
    medium: 'w-16 h-16 text-sm',
    large: 'w-20 h-20 text-base',
  };

  const getColorClass = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`rounded-full ${getColorClass(score)} ${sizeClasses[size]} flex items-center justify-center text-white font-bold`}>
      {score}%
    </div>
  );
}
