const APP_ID = 'deor';
const NONCE_LENGTH = 16;

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function deriveNonce(secret: string, timestamp: string): Promise<string> {
  return (await hmac(secret, `nonce:${timestamp}`)).slice(0, NONCE_LENGTH);
}

async function deriveSignature(
  secret: string,
  timestamp: string,
  nonce: string,
): Promise<string> {
  return hmac(secret, `${timestamp}:${nonce}:${APP_ID}`);
}

export async function generateClientToken(): Promise<string> {
  const secret = import.meta.env.VITE_CLIENT_TOKEN_SECRET as string;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = await deriveNonce(secret, timestamp);
  const signature = await deriveSignature(secret, timestamp, nonce);
  return `${timestamp}.${nonce}.${signature}`;
}
