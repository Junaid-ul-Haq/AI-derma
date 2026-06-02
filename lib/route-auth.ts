import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export type AppJwtPayload = {
  sub?: string;
  id?: string;
  email?: string;
  role?: string;
  name?: string;
};

/**
 * Read the NextAuth JWT inside App Router route handlers.
 *
 * On Next.js 16+, `getServerSession(authOptions)` can throw or behave inconsistently
 * in some route-handler contexts. `getToken` matches the middleware approach (cookie-based)
 * and is reliable here.
 */
export async function getAuthJwt(request: NextRequest): Promise<AppJwtPayload | null> {
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (!secret) {
    console.error('route-auth: NEXTAUTH_SECRET (or AUTH_SECRET) is not set');
    return null;
  }

  const cookiesObj: Record<string, string> = {};
  for (const c of request.cookies.getAll()) {
    cookiesObj[c.name] = c.value;
  }

  try {
    const token = await getToken({
      req: {
        headers: Object.fromEntries(request.headers),
        cookies: cookiesObj,
      } as any,
      secret,
    });
    return (token as AppJwtPayload | null) ?? null;
  } catch (e) {
    console.error('route-auth: getToken failed', e);
    return null;
  }
}

export function jwtUserId(token: AppJwtPayload): string | undefined {
  const raw = token.id ?? token.sub;
  return raw != null ? String(raw) : undefined;
}
