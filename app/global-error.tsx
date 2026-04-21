'use client';

// Last-resort error boundary that wraps the root layout itself.
// Must declare <html> and <body> because it replaces everything above it.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          }}
        >
          <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#204CC7', margin: '0 0 8px' }}>
              Critical error
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>
              The app crashed
            </h1>
            <p style={{ color: '#4b5563', margin: '0 0 24px' }}>
              Please refresh the page. If this keeps happening, contact support.
            </p>
            {error.digest && (
              <p
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  margin: '0 0 24px',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                }}
              >
                Reference: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                color: '#ffffff',
                background: '#204CC7',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
