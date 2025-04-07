import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4 min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}