'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook into your error reporter here (Sentry, Datadog, etc.)
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-sm font-semibold text-brand mb-2">Something went wrong</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">We hit a snag</h1>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Try again or head back home.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">Reference: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}
