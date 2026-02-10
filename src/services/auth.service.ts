import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';
import { SignupData, LoginData, AuthResponse } from '../types/auth';

export class AuthService {
  static async signup(data: SignupData): Promise<AuthResponse> {
    const { email, password } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = await this.createRefreshToken(user.id);
    
    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        currencyCode: user.currencyCode,
      },
    };
  }

  static async login(data: LoginData): Promise<AuthResponse & { refreshToken: string }> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        currencyCode: user.currencyCode,
      },
    };
  }

  static async createRefreshToken(userId: string): Promise<string> {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  static async refresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: dbToken.id },
      data: { revoked: true },
    });

    // Generate new pair
    const newToken = generateToken({ userId: dbToken.user.id, email: dbToken.user.email });
    const newRefreshToken = await this.createRefreshToken(dbToken.user.id);

    return { token: newToken, refreshToken: newRefreshToken };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        currencyCode: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error('User not found');
    return user;
  }

  static async logout(refreshToken: string) {
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  }
}
