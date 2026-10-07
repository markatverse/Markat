import { randomBytes } from 'node:crypto';

const JWT_SECRET_PATTERN = /^[a-f0-9]{64}$/i;

export function getJwtSecret(
  secret = process.env.JWT_SECRET,
  nodeEnv = process.env.NODE_ENV,
): string {
  if (!secret && nodeEnv !== 'production') {
    return randomBytes(32).toString('hex');
  }

  if (!secret || !JWT_SECRET_PATTERN.test(secret)) {
    throw new Error(
      'In production, JWT_SECRET must be a cryptographically random 64-character hexadecimal value. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }

  return secret;
}
