import logger from './logger.js';

// Required env vars — without these the server cannot function safely.
const REQUIRED = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
];

// Fingerprint of placeholder values shipped in the repo. Refuse to start
// if any of these are still in use — protects against deploying with secrets
// that an attacker can simply read from git history.
const KNOWN_PLACEHOLDERS = [
  'luxe_jwt_super_secret_2026_change_in_prod',
  'change_in_prod',
  'placeholder',
  'your-secret-here',
];

const isWeakSecret = (val) => {
  if (!val) return true;
  if (val.length < 32) return true;
  return KNOWN_PLACEHOLDERS.some((p) => val.toLowerCase().includes(p));
};

export const checkEnv = () => {
  const errors = [];

  for (const key of REQUIRED) {
    if (!process.env[key]) errors.push(`Missing ${key}`);
  }

  if (process.env.JWT_SECRET && isWeakSecret(process.env.JWT_SECRET)) {
    errors.push('JWT_SECRET is a placeholder or too short (need >=32 chars). Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  }
  if (process.env.JWT_REFRESH_SECRET && isWeakSecret(process.env.JWT_REFRESH_SECRET)) {
    errors.push('JWT_REFRESH_SECRET is a placeholder or too short (need >=32 chars).');
  }

  if (errors.length) {
    logger.fatal({ errors }, 'Environment check failed — refusing to start');
    for (const e of errors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }

  logger.info('Environment check passed.');
};
