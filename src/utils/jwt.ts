import jwt, { Secret, SignOptions } from 'jsonwebtoken';

// Payload type
export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  phone?: string;
  birthdate?: string | null;
  gender?: string;
  country?: string;
}

// JWT secrets and expiration
const jwtSecret: Secret = process.env.JWT_SECRET ?? 'default-access-secret';
const jwtExpire: string = process.env.JWT_EXPIRE ?? '7d';

const jwtRefreshSecret: Secret = process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret';
const jwtRefreshExpire: string = process.env.JWT_REFRESH_EXPIRE ?? '30d';

// Generate access token
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload as object, jwtSecret, { expiresIn: jwtExpire } as SignOptions);
};

// Generate refresh token
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload as object, jwtRefreshSecret, { expiresIn: jwtRefreshExpire } as SignOptions);
};

// Verify access token
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtSecret) as TokenPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, jwtRefreshSecret) as TokenPayload;
};

// Decode token without verification
export const decodeToken = (token: string): TokenPayload | null => {
  const decoded = jwt.decode(token);
  return decoded ? (decoded as TokenPayload) : null;
};
