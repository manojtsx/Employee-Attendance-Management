import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'EMPLOYEE';
}

export interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}

/**
 * Register a new user
 */
export async function registerUser(userData: RegisterUserData): Promise<RegisterResponse> {
  try {
    const { email, password, name, role = 'EMPLOYEE' } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error registering user:', error);
    return {
      success: false,
      error: 'Failed to register user',
    };
  }
}

/**
 * Check if email is already registered
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
}

/**
 * Validate admin registration code
 */
export function validateAdminCode(code: string): boolean {
  const adminCode = process.env.ADMIN_REGISTRATION_CODE || 'ADMIN123';
  return code === adminCode;
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, role: 'ADMIN' | 'EMPLOYEE') {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    return { success: true, user };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}
