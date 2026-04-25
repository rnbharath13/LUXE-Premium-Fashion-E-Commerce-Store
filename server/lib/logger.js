import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV === 'development' && {
    transport: { target: 'pino-pretty', options: { colorize: true, ignore: 'pid,hostname' } },
  }),
  base: { service: 'luxe-auth' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['password', 'password_hash', 'token', 'refreshToken', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
});

export const authLog = {
  loginSuccess:        (userId, email, ip) => logger.info ({ event: 'LOGIN_SUCCESS',          userId, email, ip }),
  loginFailed:         (email, ip, reason) => logger.warn ({ event: 'LOGIN_FAILED',            email, ip, reason }),
  loginLocked:         (email, ip)         => logger.warn ({ event: 'LOGIN_ACCOUNT_LOCKED',    email, ip }),
  registerSuccess:     (userId, email, ip) => logger.info ({ event: 'REGISTER_SUCCESS',        userId, email, ip }),
  registerDuplicate:   (email, ip)         => logger.warn ({ event: 'REGISTER_DUPLICATE_EMAIL',email, ip }),
  logoutSuccess:       (userId, ip)        => logger.info ({ event: 'LOGOUT_SUCCESS',          userId, ip }),
  tokenRefreshed:      (userId, ip)        => logger.info ({ event: 'TOKEN_REFRESHED',         userId, ip }),
  tokenReuseSuspected: (userId, ip)        => logger.error({ event: 'TOKEN_REUSE_SUSPECTED',   userId, ip }),
  tokenInvalid:        (ip, reason)        => logger.warn ({ event: 'TOKEN_INVALID',           ip, reason }),
  passwordResetRequest:(email, ip)         => logger.info ({ event: 'PASSWORD_RESET_REQUEST',  email, ip }),
  passwordResetSuccess:(userId, ip)        => logger.info ({ event: 'PASSWORD_RESET_SUCCESS',  userId, ip }),
  emailVerified:       (userId, ip)        => logger.info ({ event: 'EMAIL_VERIFIED',          userId, ip }),
};

export default logger;
