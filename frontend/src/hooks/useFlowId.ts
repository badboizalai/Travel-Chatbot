import { useState, useEffect, useCallback } from 'react';
import { langflowApi } from '../services/langflowApi';

interface FlowIdStatus {
  flowId: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useFlowId = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [status, setStatus] = useState<FlowIdStatus>({
    flowId: langflowApi.getFlowId(),
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const refreshFlowId = useCallback(async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const newFlowId = await langflowApi.refreshFlowId();
      setStatus({
        flowId: newFlowId,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });
      
      console.log('✅ Flow ID refreshed successfully:', newFlowId);
      return newFlowId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      
      console.error('❌ Failed to refresh flow ID:', error);
      throw error;
    }
  }, []);

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    // Initial refresh
    refreshFlowId().catch(() => {
      // Error already handled in refreshFlowId
    });

    // Set up interval for auto refresh
    const interval = setInterval(() => {
      refreshFlowId().catch(() => {
        // Error already handled in refreshFlowId
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshFlowId]);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    return await refreshFlowId();
  }, [refreshFlowId]);

  // Update flow ID manually
  const updateFlowId = useCallback((newFlowId: string) => {
    langflowApi.updateFlowId(newFlowId);
    setStatus(prev => ({
      ...prev,
      flowId: newFlowId,
      lastUpdated: new Date(),
      error: null
    }));
    
    console.log('🔄 Flow ID updated manually:', newFlowId);
  }, []);

  return {
    ...status,
    refreshFlowId: manualRefresh,
    updateFlowId
  };
};
