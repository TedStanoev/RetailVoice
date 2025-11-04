import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50" role="status" aria-live="polite">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        <p className="text-purple-300 text-lg font-semibold">Analyzing data...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;