import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'alfa_yonetim_oturum';

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'AlfaGaraj2026!';
}

function getSigningSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `alfa-garaj-secret::${getAdminPassword()}`;
}

export function verifyPasswordInput(input: string): boolean {
  const expected = Buffer.from(getAdminPassword(), 'utf8');
  const provided = Buffer.from(input || '', 'utf8');
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(expected, provided);
}

export function createSessionToken(): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 14; // 14 gün
  const payload = `admin:${exp}`;
  const sig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token?: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const [, expStr] = payload.split(':');
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return false;

  const expectedSig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
