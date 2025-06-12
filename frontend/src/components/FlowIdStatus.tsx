import React from 'react';
import { useFlowId } from '../hooks/useFlowId';

interface FlowIdStatusProps {
  showControls?: boolean;
  className?: string;
}

export const FlowIdStatus: React.FC<FlowIdStatusProps> = ({ 
  showControls = true, 
  className = '' 
}) => {
  const { flowId, refreshFlowId, updateFlowId, isLoading, error, lastUpdated } = useFlowId();

  const handleRefresh = async () => {
    try {
      await refreshFlowId();
    } catch (error) {
      console.error('Failed to refresh flow ID:', error);
    }
  };

  const handleManualUpdate = () => {
    const newFlowId = prompt('Enter new Flow ID:', flowId);
    if (newFlowId && newFlowId !== flowId) {
      updateFlowId(newFlowId);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(flowId);
    // You might want to show a toast notification here
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Flow ID Status</h3>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          error ? 'bg-red-100 text-red-800' : 
          isLoading ? 'bg-yellow-100 text-yellow-800' : 
          'bg-green-100 text-green-800'
        }`}>
          {error ? 'Error' : isLoading ? 'Loading' : 'Active'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Flow ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Flow ID
          </label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-mono">
              {flowId}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
            >
              📋
            </button>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-sm text-gray-600">
              {lastUpdated.toLocaleString()}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </span>
              ) : (
                'Refresh Flow ID'
              )}
            </button>
            
            <button
              onClick={handleManualUpdate}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Update Manually
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowIdStatus;
