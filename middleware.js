// File location: middleware.js  (root of project, same level as pages/)
// Runs on the Edge before any /Admin page is rendered.
// If no CF_Authorization cookie exists, redirects to Cloudflare Access login.

import { NextResponse } from 'next/server';

export const config = {
  // Protect everything under /Admin
  matcher: ['/Admin', '/Admin/:path*'],
};

export function middleware(request) {
  const token = request.cookies.get('CF_Authorization')?.value;

  // No token at all → send to Cloudflare Access login
  if (!token) {
    const loginUrl = `https://${process.env.CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/login` +
      `?redirect_url=${encodeURIComponent(request.url)}`;

    return NextResponse.redirect(loginUrl);
  }

  // Token exists — let the request through.
  // Full JWT signature verification happens in /api/verify-admin
  // (Edge runtime can't use Node crypto libs like jwk-to-pem).
  return NextResponse.next();
}