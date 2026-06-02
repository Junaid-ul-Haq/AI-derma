import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't need authentication
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/signup',
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/);

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the token from the request
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
  });

  // If no token and trying to access protected route, redirect to signin
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    if (pathname.startsWith('/doctor')) {
      signInUrl.searchParams.set('type', 'doctor');
    } else if (pathname.startsWith('/user')) {
      // User routes - no special type needed
    }
    return NextResponse.redirect(signInUrl);
  }

  // Get user role from token
  const role = (token as any)?.role;

  // Admin routes - only ADMIN can access
  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      if (role === 'DOCTOR') {
        return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Doctor routes - only DOCTOR can access
  if (pathname.startsWith('/doctor')) {
    if (role !== 'DOCTOR') {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // User routes - only USER can access
  if (pathname.startsWith('/user')) {
    if (role !== 'USER') {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (role === 'DOCTOR') {
        return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Doctors listing and booking pages - only USER can access
  if (pathname.startsWith('/doctors')) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (role === 'DOCTOR') {
      return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Upload route - only USER can access
  if (pathname.startsWith('/upload')) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (role === 'DOCTOR') {
      return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Consultation detail + video room — accessible by USER and DOCTOR
  if (pathname.startsWith('/consultation') || pathname.startsWith('/video-room')) {
    if (!role || (role !== 'USER' && role !== 'DOCTOR')) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup')) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (role === 'DOCTOR') {
      return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

