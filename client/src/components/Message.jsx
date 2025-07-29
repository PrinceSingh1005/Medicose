import React from 'react';

function Message({ type, children }) {
  const getClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  return (
    <div className={`p-3 rounded-md border ${getClasses()} mb-4`} role="alert">
      {children}
    </div>
  );
}

export default Message;