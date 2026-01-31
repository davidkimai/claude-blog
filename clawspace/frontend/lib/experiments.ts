/**
 * Client-side A/B testing utilities
 * Handles variant assignment and conversion tracking
 */

import { useState, useEffect } from 'react';

interface ExperimentAssignment {
  experimentId: string;
  variantId: string;
}

interface ExperimentConfig {
  experimentId: string;
  variants: {
    id: string;
    name: string;
    weight: number;
  }[];
}

class ExperimentsClient {
  private assignments: Map<string, string> = new Map();
  private storageKey = 'clawspace_experiments';

  constructor() {
    this.loadAssignments();
  }

  private loadAssignments(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.assignments = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Failed to load experiment assignments:', error);
    }
  }

  private saveAssignments(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = Object.fromEntries(this.assignments);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save experiment assignments:', error);
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Get variant assignment for an experiment
   * Uses deterministic hashing for consistent assignment
   */
  getVariant(userId: string, experimentId: string, variants: { id: string; weight: number }[]): string {
    const key = `${experimentId}:${userId}`;
    
    // Check for cached assignment
    if (this.assignments.has(key)) {
      return this.assignments.get(key)!;
    }
    
    // Generate deterministic assignment
    const hash = this.hashString(key);
    const normalizedHash = hash % 100;
    
    let cumulative = 0;
    let assignedVariant = variants[0]?.id;
    
    for (const variant of variants) {
      cumulative += variant.weight * 100;
      if (normalizedHash < cumulative) {
        assignedVariant = variant.id;
        break;
      }
    }
    
    // Cache the assignment
    this.assignments.set(key, assignedVariant!);
    this.saveAssignments();
    
    return assignedVariant!;
  }

  /**
   * Get all active experiment assignments for a user
   */
  async getActiveExperiments(userId: string): Promise<ExperimentAssignment[]> {
    try {
      const res = await fetch('/experiments/user/assignments');
      return await res.json();
    } catch (error) {
      console.error('Failed to fetch active experiments:', error);
      return [];
    }
  }

  /**
   * Track a conversion event
   */
  async trackConversion(
    userId: string,
    experimentId: string,
    metric: string,
    value: number = 1,
  ): Promise<void> {
    try {
      await fetch(`/experiments/${experimentId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric, value }),
      });
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  }

  /**
   * Track a conversion with automatic variant detection
   */
  async trackConversionAuto(
    experimentId: string,
    metric: string,
    value: number = 1,
  ): Promise<void> {
    const userId = this.getUserId();
    if (!userId) {
      console.warn('No user ID available for conversion tracking');
      return;
    }
    
    await this.trackConversion(userId, experimentId, metric, value);
  }

  /**
   * Get variant for an experiment from server
   */
  async assignVariant(experimentId: string): Promise<string | null> {
    const userId = this.getUserId();
    if (!userId) return null;
    
    try {
      const res = await fetch(`/experiments/${experimentId}/assign?userId=${userId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error('Failed to assign variant:', error);
    }
    
    return null;
  }

  /**
   * Get or create user ID
   */
  private getUserId(): string {
    if (typeof window === 'undefined') return '';
    
    let userId = localStorage.getItem('clawspace_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('clawspace_user_id', userId);
    }
    return userId;
  }

  /**
   * Check if a feature is enabled for the current user
   */
  async isFeatureEnabled(
    featureFlag: string,
    experimentId: string,
    variantId: string,
  ): Promise<boolean> {
    const userId = this.getUserId();
    if (!userId) return false;
    
    try {
      const assignment = await this.assignVariant(experimentId);
      return assignment === variantId;
    } catch (error) {
      // Fallback to local assignment
      const assignment = this.getVariant(userId, experimentId, [
        { id: variantId, weight: 0.5 },
        { id: 'control', weight: 0.5 },
      ]);
      return assignment === variantId;
    }
  }

  /**
   * Clear all experiment assignments (for testing)
   */
  clearAssignments(): void {
    this.assignments.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}

// Export singleton instance
export const experiments = new ExperimentsClient();

// React hook for using experiments
export function useExperiment(experimentId: string, variants: { id: string; weight: number }[]) {
  const [variant, setVariant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('clawspace_user_id') : null;
    if (!userId) {
      setLoading(false);
      return;
    }

    const assigned = experiments.getVariant(userId, experimentId, variants);
    setVariant(assigned);
    setLoading(false);
  }, [experimentId, variants]);

  return { variant, loading };
}
