'use client';

import { useState, useEffect } from 'react';
import { Experiment, ExperimentStatus } from '@/lib/types/modules';

interface ExperimentResult {
  totalParticipants: number;
  variantResults: Record<string, {
    variantId: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    mean: number;
    stdDev: number;
    confidenceInterval: [number, number];
  }>;
  statisticalSignificance: number;
  isSignificant: boolean;
  winner: string | null;
  uplift: number;
}

export default function ExperimentsDashboard() {
  const [experiments, setExperiments] = useState<(Experiment & { results?: ExperimentResult })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function fetchExperiments() {
      try {
        const res = await fetch('/experiments');
        const data = await res.json();
        setExperiments(data);
      } catch (error) {
        console.error('Failed to fetch experiments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchExperiments();
  }, []);

  const getStatusColor = (status: ExperimentStatus) => {
    switch (status) {
      case ExperimentStatus.RUNNING:
        return 'bg-green-100 text-green-700';
      case ExperimentStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-700';
      case ExperimentStatus.COMPLETED:
        return 'bg-blue-100 text-blue-700';
      case ExperimentStatus.DRAFT:
        return 'bg-gray-100 text-gray-700';
      case ExperimentStatus.ARCHIVED:
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">A/B Testing Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Manage experiments and analyze results
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Experiment
          </button>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Experiments</p>
            <p className="text-2xl font-bold text-gray-900">{experiments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Running</p>
            <p className="text-2xl font-bold text-green-600">
              {experiments.filter((e) => e.status === ExperimentStatus.RUNNING).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-blue-600">
              {experiments.filter((e) => e.status === ExperimentStatus.COMPLETED).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Statistically Significant</p>
            <p className="text-2xl font-bold text-purple-600">
              {experiments.filter((e) => e.results?.isSignificant).length}
            </p>
          </div>
        </div>

        {/* Experiments list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Variants</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Participants</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Uplift</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Confidence</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-4">
                        <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : experiments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No experiments yet. Create your first one!
                    </td>
                  </tr>
                ) : (
                  experiments.map((experiment) => (
                    <tr key={experiment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{experiment.name}</p>
                        {experiment.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {experiment.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(experiment.status)}`}>
                          {experiment.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex -space-x-2">
                          {experiment.variants.map((v, i) => (
                            <div
                              key={v.id}
                              className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                              title={v.name}
                            >
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-900">
                        {experiment.results?.totalParticipants || 0}
                      </td>
                      <td className="px-4 py-4">
                        {experiment.results ? (
                          <span className={experiment.results.uplift > 0 ? 'text-green-600' : 'text-red-600'}>
                            {experiment.results.uplift > 0 ? '+' : ''}{experiment.results.uplift.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {experiment.results ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${experiment.results.isSignificant ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${experiment.results.statisticalSignificance * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round(experiment.results.statisticalSignificance * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedExperiment(experiment.id)}
                            className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            View
                          </button>
                          {experiment.status === ExperimentStatus.DRAFT && (
                            <button className="px-2 py-1 text-sm text-green-600 hover:bg-green-50 rounded">
                              Start
                            </button>
                          )}
                          {experiment.status === ExperimentStatus.RUNNING && (
                            <button className="px-2 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded">
                              Pause
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
