// middleware.js
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/Admin', '/Admin/:path*'],
};

const CF_TEAM_DOMAIN = 'kapilpandey2068.cloudflareaccess.com'; // ← hardcoded

export function middleware(request) {
  const host = request.headers.get('host') || '';
  
  // Skip on localhost
  if (host.includes('localhost')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('CF_Authorization')?.value;

  if (!token) {
    const loginUrl = `https://${CF_TEAM_DOMAIN}/cdn-cgi/access/login` +
      `?redirect_url=${encodeURIComponent(request.url)}`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}