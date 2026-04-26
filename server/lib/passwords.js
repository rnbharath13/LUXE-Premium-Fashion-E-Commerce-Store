// Common-password denylist. Catches the most-attacked passwords without a network call.
// For full coverage, swap to the HaveIBeenPwned k-anonymity API later.
const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234', 'password12345',
  'qwerty', 'qwerty123', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1q2w3e4r', '1qaz2wsx',
  'admin', 'admin123', 'administrator', 'root', 'toor',
  'welcome', 'welcome1', 'welcome123', 'letmein', 'letmein1', 'letmein123',
  'iloveyou', 'iloveyou1', 'sunshine', 'monkey', 'dragon', 'master', 'shadow',
  '12345678', '123456789', '1234567890', '11111111', '00000000', '87654321',
  'abc123', 'abcd1234', 'abcdefgh', 'qazwsx', 'trustno1',
  'football', 'baseball', 'superman', 'batman', 'starwars',
  'changeme', 'default', 'guest', 'login', 'pass', 'passw0rd', 'p@ssw0rd', 'p@ssword',
]);

// Returns null if the password is acceptable, or a human-readable reason if not.
// Note: length / character-class rules live on the Zod schema; this layer adds the
// rules that aren't expressible as regex (denylist, repeating-character pattern).
export const validatePasswordStrength = (pwd) => {
  if (typeof pwd !== 'string') return 'Password is required';
  const lower = pwd.toLowerCase();
  if (COMMON.has(lower))                            return 'This password is too common — choose something stronger';
  if (/^(.)\1+$/.test(pwd))                         return 'Password cannot be a single repeated character';
  if (/^(0123456789|1234567890|9876543210)/.test(pwd)) return 'Password is too predictable';
  return null;
};
