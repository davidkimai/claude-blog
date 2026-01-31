import React, { useState, useEffect, useRef } from 'react';

interface InfluenceNode {
  id: string;
  name: string;
  avatar_url?: string;
  influence_score: number;
  type: 'source' | 'target';
}

interface InfluenceEdge {
  source: string;
  target: string;
  influence_score: number;
}

interface InfluenceGraphProps {
  agentId: string;
  nodes: InfluenceNode[];
  edges: InfluenceEdge[];
  onNodeClick?: (agentId: string) => void;
}

export function InfluenceGraph({ agentId, nodes, edges, onNodeClick }: InfluenceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Calculate node positions in a circular layout
  const centerX = 200;
  const centerY = 200;
  const radius = 120;

  const getNodePosition = (index: number, total: number) => {
    if (total === 1) return { x: centerX, y: centerY };
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const getNodeColor = (score: number) => {
    if (score >= 0.7) return '#22c55e'; // green
    if (score >= 0.4) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
    onNodeClick?.(nodeId);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <h3 className="font-semibold text-gray-700 mb-4">Influence Network</h3>
      
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full h-auto max-h-[400px]"
      >
        {/* Edges */}
        <g>
          {edges.map((edge, index) => {
            const sourceIndex = nodes.findIndex(n => n.id === edge.source);
            const targetIndex = nodes.findIndex(n => n.id === edge.target);
            const sourcePos = getNodePosition(sourceIndex, nodes.length);
            const targetPos = getNodePosition(targetIndex, nodes.length);

            return (
              <line
                key={index}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke="#e5e7eb"
                strokeWidth={edge.influence_score * 4}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node, index) => {
            const pos = getNodePosition(index, nodes.length);
            const isSelected = selectedNode === node.id;
            const isCenter = node.id === agentId;

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer"
              >
                {/* Outer ring for selected node */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isCenter ? 35 : 28}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                )}

                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isCenter ? 30 : 24}
                  fill={isCenter ? '#3b82f6' : getNodeColor(node.influence_score)}
                  className="transition-all"
                />

                {/* Avatar placeholder */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={isCenter ? 16 : 12}
                  fontWeight="bold"
                >
                  {node.name.charAt(0).toUpperCase()}
                </text>

                {/* Score label */}
                <text
                  x={pos.x}
                  y={pos.y + isCenter ? 45 : 38}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#6b7280"
                >
                  {Math.round(node.influence_score * 100)}%
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>High Influence (≥70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Medium (40-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Low (&lt;40%)</span>
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            {nodes.find(n => n.id === selectedNode)?.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Influence Score: {Math.round(
              (nodes.find(n => n.id === selectedNode)?.influence_score || 0) * 100
            )}%
          </p>
        </div>
      )}
    </div>
  );
}
