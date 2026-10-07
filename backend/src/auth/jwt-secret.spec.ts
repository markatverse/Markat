import { getJwtSecret } from './jwt-secret.js';

describe('getJwtSecret', () => {
  it('accepts a 256-bit hexadecimal secret', () => {
    const secret = 'a'.repeat(64);
    expect(getJwtSecret(secret)).toBe(secret);
  });

  it.each([
    '',
    'supersecretjwt',
    'a'.repeat(63),
    'g'.repeat(64),
  ])('rejects a missing or weak production secret', (secret) => {
    expect(() => getJwtSecret(secret, 'production')).toThrow(/64-character hexadecimal/);
  });

  it('generates an ephemeral secret for local development', () => {
    const secret = getJwtSecret(undefined, 'development');
    expect(secret).toMatch(/^[a-f0-9]{64}$/);
  });

  it('requires a configured secret in production', () => {
    expect(() => getJwtSecret(undefined, 'production')).toThrow(/JWT_SECRET/);
  });
});
