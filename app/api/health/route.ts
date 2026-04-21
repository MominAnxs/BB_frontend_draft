import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

/**
 * Liveness probe — returns 200 OK as long as the server is up.
 * Use for Vercel monitors, uptime pings, or container health checks.
 */
export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'bb-frontend',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}
