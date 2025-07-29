import React from 'react';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full min-h-[200px]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
    </div>
  );
}

export default LoadingSpinner;