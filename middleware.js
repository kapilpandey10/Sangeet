// middleware.js
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/Admin', '/Admin/:path*'],
};

export function middleware(request) {
  // Skip on localhost
  const host = request.headers.get('host') || '';
  if (host.includes('localhost')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('CF_Authorization')?.value;

  if (!token) {
    // Use NEXT_PUBLIC_ prefix — only these work in Edge middleware
    const teamDomain = process.env.NEXT_PUBLIC_CF_ACCESS_TEAM_DOMAIN;
    const loginUrl = `https://${teamDomain}/cdn-cgi/access/login` +
      `?redirect_url=${encodeURIComponent(request.url)}`;

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}