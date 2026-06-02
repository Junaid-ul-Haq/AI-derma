// Stream Video SDK — server-side helpers
// Docs: https://getstream.io/video/docs/
import { StreamClient } from '@stream-io/node-sdk';

let _client: StreamClient | null = null;

function getStreamClient(): StreamClient {
  if (!_client) {
    const key    = process.env.STREAM_API_KEY!;
    const secret = process.env.STREAM_API_SECRET!;
    if (!key || !secret) throw new Error('STREAM_API_KEY / STREAM_API_SECRET not set in .env.local');
    _client = new StreamClient(key, secret);
  }
  return _client;
}

/** Generate a short-lived token for a given user */
export async function generateStreamToken(userId: string): Promise<string> {
  const client = getStreamClient();
  // expires in 1 hour
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return client.generateUserToken({ user_id: userId, exp });
}

/** Create a Stream "default" video call — called once when consultation is accepted */
export async function createStreamCall(
  callId: string,
  doctorUserId: string,
  patientUserId: string
): Promise<void> {
  const client = getStreamClient();
  const call = client.video.call('default', callId);
  await call.getOrCreate({
    data: {
      created_by_id: doctorUserId,
      members: [
        { user_id: doctorUserId, role: 'host' },
        { user_id: patientUserId, role: 'user' },
      ],
    },
  });
}
