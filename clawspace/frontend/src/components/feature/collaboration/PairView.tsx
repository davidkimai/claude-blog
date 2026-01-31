import React, { useState, useEffect } from 'react';
import { PairCard } from './PairCard';
import { PairChat } from './PairChat';
import { CompatibilityScore } from './CompatibilityScore';

interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  skills?: string[];
}

interface PairData {
  id: string;
  agent_a: Agent;
  agent_b: Agent;
  compatibility_score: number;
  collaboration_type: string;
  status: string;
  shared_context?: Record<string, any>;
  started_at?: string;
}

interface PairViewProps {
  pairId: string;
  currentUserId: string;
}

export function PairView({ pairId, currentUserId }: PairViewProps) {
  const [pair, setPair] = useState<PairData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'chat'>('split');

  useEffect(() => {
    fetchPair();
    fetchMessages();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [pairId]);

  const fetchPair = async () => {
    try {
      const response = await fetch(`/api/collaborations/${pairId}`);
      const data = await response.json();
      setPair(data);
    } catch (error) {
      console.error('Failed to fetch pair:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/collaborations/${pairId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const connectWebSocket = () => {
    // WebSocket connection would be established here
    setIsConnected(true);
  };

  const disconnectWebSocket = () => {
    setIsConnected(false);
  };

  const handleSendMessage = async (content: string, messageType?: string) => {
    try {
      const response = await fetch('/api/collaborations/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairId, content, message_type: messageType }),
      });
      const data = await response.json();
      if (data.success) {
        // Optimistically add message
        const newMessage = {
          id: data.messageId,
          sender_id: currentUserId,
          sender_name: 'You',
          content,
          message_type: messageType || 'text',
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAccept = async () => {
    try {
      await fetch(`/api/collaborations/${pairId}/accept`, { method: 'POST' });
      fetchPair();
    } catch (error) {
      console.error('Failed to accept pair:', error);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Reason for rejection:');
    if (reason) {
      try {
        await fetch(`/api/collaborations/${pairId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        fetchPair();
      } catch (error) {
        console.error('Failed to reject pair:', error);
      }
    }
  };

  const handleEnd = async () => {
    const summary = prompt('Collaboration summary:');
    if (summary !== null) {
      try {
        await fetch(`/api/collaborations/${pairId}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary }),
        });
        fetchPair();
      } catch (error) {
        console.error('Failed to end pair:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!pair) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Pair not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* View Mode Toggle - Mobile */}
      <div className="lg:hidden flex p-2 gap-2 bg-gray-100">
        <button
          onClick={() => setViewMode('split')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'split' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Split View
        </button>
        <button
          onClick={() => setViewMode('chat')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            viewMode === 'chat' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
          }`}
        >
          Chat
        </button>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex ${viewMode === 'split' ? 'lg:flex-row flex-col' : 'flex-col'} gap-4 p-4`}>
        {/* Agent Panel */}
        <div className={`flex-1 ${viewMode === 'split' ? 'lg:block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl shadow-md p-6 h-full">
            {/* Compatibility Score */}
            <div className="flex justify-center mb-6">
              <CompatibilityScore score={pair.compatibility_score} size="large" />
            </div>

            {/* Pair Card */}
            <PairCard
              agentA={pair.agent_a}
              agentB={pair.agent_b}
              compatibilityScore={pair.compatibility_score}
              collaborationType={pair.collaboration_type}
              status={pair.status}
              onAccept={pair.status === 'proposed' ? handleAccept : undefined}
              onReject={pair.status === 'proposed' ? handleReject : undefined}
              onEnd={pair.status === 'active' ? handleEnd : undefined}
            />

            {/* Shared Context */}
            {pair.shared_context && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Collaboration Context</h4>
                <pre className="text-sm text-gray-600 overflow-x-auto">
                  {JSON.stringify(pair.shared_context, null, 2)}
                </pre>
              </div>
            )}

            {/* Started At */}
            {pair.started_at && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Started: {new Date(pair.started_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`${viewMode === 'chat' ? 'block' : 'hidden lg:block'} lg:w-96`}>
          <PairChat
            pairId={pairId}
            currentUserId={currentUserId}
            messages={messages}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  );
}
