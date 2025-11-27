import { z } from 'zod';

export const SignupDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character'
    ),
  name: z.string().min(1, 'Name is required').optional(),
});

export const LoginDtoSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenDtoSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type SignupDto = z.infer<typeof SignupDtoSchema>;
export type LoginDto = z.infer<typeof LoginDtoSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDtoSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}
