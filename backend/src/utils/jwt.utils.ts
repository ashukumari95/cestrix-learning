import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_refresh_secret';

export const generateTokens = (userId: string, role: string, organizationId?: string) => {
  const accessToken = jwt.sign({ userId, role, organizationId }, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, isRefresh = false) => {
  const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
  return jwt.verify(token, secret);
};
