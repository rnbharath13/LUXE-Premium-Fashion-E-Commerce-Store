import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8,   'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  email:     z.string().email('Invalid email address'),
  password:  passwordSchema,
  firstName: z.string().max(50).optional(),
  lastName:  z.string().max(50).optional(),
});

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128),
});

export const updateProfileSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName:  z.string().max(50).optional(),
  phone:     z.string().regex(/^\+?[\d\s\-()]{7,15}$/, 'Invalid phone number').optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1, 'Token is required'),
  userId:   z.string().min(1, 'User ID is required'),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
