import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const ErrorPage = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 text-center">
    <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
      <AlertTriangle className="w-10 h-10 text-red-400" />
    </div>

    <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
    <p className="text-slate-400 text-sm mb-2 max-w-xs">
      An unexpected error occurred. You can try again or return to the dashboard.
    </p>
    {error?.message && (
      <p className="text-xs text-slate-500 font-mono bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg mb-6 max-w-sm truncate">
        {error.message}
      </p>
    )}

    <div className="flex flex-col sm:flex-row gap-3">
      {resetErrorBoundary && (
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
      <Link
        to="/admin"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:border-slate-600 hover:bg-slate-800 transition-colors"
      >
        <Home className="w-4 h-4" />
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default ErrorPage;
