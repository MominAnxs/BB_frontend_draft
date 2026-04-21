import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-sm font-semibold text-brand mb-2">404</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-600 mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
