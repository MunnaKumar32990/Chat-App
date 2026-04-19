import React from 'react';

const Loading = ({ fullScreen = false }) => {
  const loadingContent = (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 dark:border-primary-400"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        {loadingContent}
      </div>
    );
  }

  return loadingContent;
};

export default Loading; 