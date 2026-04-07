import { createHmac, randomInt, timingSafeEqual } from 'crypto';

/**
 * Stateless math captcha. Server generates a question and a signed token
 * that encodes the expected answer + issue timestamp. Client returns the
 * token together with the user's answer; server verifies the HMAC and TTL.
 */

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const SECRET =
  process.env.CAPTCHA_SECRET ||
  process.env.AUTH_SECRET ||
  'dev-only-captcha-secret-change-me';

export interface CaptchaChallenge {
  question: string;
  token: string;
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

export function createChallenge(): CaptchaChallenge {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const op = randomInt(0, 2) === 0 ? '+' : '-';
  const answer = op === '+' ? a + b : a - b;
  const issuedAt = Date.now();
  const payload = `${answer}.${issuedAt}`;
  const token = `${payload}.${sign(payload)}`;
  return {
    question: `${a} ${op} ${b} = ?`,
    token,
  };
}

export function verifyChallenge(token: string, userAnswer: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [answerStr, issuedAtStr, providedSig] = parts;
  const payload = `${answerStr}.${issuedAtStr}`;
  const expectedSig = sign(payload);

  if (providedSig.length !== expectedSig.length) return false;
  const sigMatches = timingSafeEqual(
    Buffer.from(providedSig, 'hex'),
    Buffer.from(expectedSig, 'hex')
  );
  if (!sigMatches) return false;

  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > TTL_MS) return false;

  const expected = Number(answerStr);
  const provided = Number(String(userAnswer).trim());
  if (!Number.isFinite(provided)) return false;
  return expected === provided;
}
