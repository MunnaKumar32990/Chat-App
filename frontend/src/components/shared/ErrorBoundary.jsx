import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The application encountered an unexpected error. You can try refreshing the page or contact support if the problem persists.
            </p>
            <div className="mb-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Error Details:
                </h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto max-h-64 text-sm">
                  <p className="text-red-600 dark:text-red-400">
                    {this.state.error && this.state.error.toString()}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 