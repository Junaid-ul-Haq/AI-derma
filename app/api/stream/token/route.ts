// GET /api/stream/token
// Returns a short-lived Stream Video token for the current user.
import { NextRequest, NextResponse } from 'next/server';
import { getAuthJwt, jwtUserId } from '../../../../lib/route-auth';
import { generateStreamToken } from '../../../../lib/stream';

export async function GET(request: NextRequest) {
  try {
    const token = await getAuthJwt(request);
    const userId = jwtUserId(token!);
    if (!token || !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const streamToken = await generateStreamToken(userId);
    return NextResponse.json({ token: streamToken, userId });
  } catch (err) {
    console.error('[stream/token]', err);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
