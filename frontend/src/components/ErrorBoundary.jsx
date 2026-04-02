import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service like Sentry here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Hard reload is often safer to clear stuck application states
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 1. If a custom fallback UI is provided via props, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 2. Otherwise, render the default "Ultimate" UI
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 m-4">
          
          {/* Icon Circle */}
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <AlertTriangle className="text-rose-600 w-8 h-8" />
          </div>

          {/* Text Content */}
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-3">
            Something went wrong
          </h2>
          <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
            We apologize for the inconvenience. It looks like we hit a snag. 
            Please try refreshing the page or return to the homepage.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <RotateCcw size={18} />
              Reload Page
            </button>
            
            <button 
              onClick={this.handleGoHome}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 hover:text-rose-600 transition-all active:scale-95"
            >
              <Home size={18} />
              Go Home
            </button>
          </div>

          {/* Technical Details (Optional: Only show in Development) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-12 p-4 bg-red-50 text-red-800 rounded-lg text-left text-xs font-mono max-w-lg w-full overflow-auto border border-red-100">
              <p className="font-bold mb-2">Error Details (Dev Only):</p>
              {this.state.error.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;