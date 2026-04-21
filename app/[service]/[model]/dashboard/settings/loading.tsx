/**
 * Instant skeleton shown while the ProfileSettings chunk loads.
 *
 * The route transitions from AccountsReports / PerformanceReports (on the
 * overview page) to the settings bundle — a separate webpack chunk that
 * hasn't been downloaded until a user clicks "Profile settings" for the
 * first time. Without this file, Next.js holds the previous page on
 * screen during the fetch, so the click feels unresponsive.
 *
 * Rendering a low-fidelity placeholder that echoes the eventual layout
 * (top bar + left nav + content column) gives immediate feedback and
 * matches what ProfileSettings mounts a moment later, so there's no
 * visual jump when the real UI takes over.
 *
 * Kept as a plain server component with no client JS, so it streams
 * before the page bundle is even requested.
 */
export default function SettingsLoading() {
  return (
    <div className="flex flex-col h-screen bg-gray-50" aria-busy="true" aria-live="polite">
      {/* Top bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left nav */}
        <aside className="w-64 border-r border-gray-200 bg-white p-4 space-y-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-gray-100 animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </aside>

        {/* Content column */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl space-y-6">
            <div className="h-7 w-48 rounded bg-gray-200 animate-pulse" />
            <div className="h-4 w-80 rounded bg-gray-100 animate-pulse" />

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
                  <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
