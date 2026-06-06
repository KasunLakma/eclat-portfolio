'use server';

import fs from 'fs/promises';
import path from 'path';
import prisma from '@/src/lib/db';
import { hashPassword, verifyPassword } from '@/src/lib/auth';

const filePath = path.join(process.cwd(), 'src/data/profile.json');

export async function getProfile() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading profile.json:', error);
    return null;
  }
}

export async function saveProfile(data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error writing profile.json:', error);
    return { success: false, error: error.message };
  }
}

async function seedDatabaseIfNeeded() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      const defaultUsers = [
        {
          email: 'actor@eclat.com',
          name: 'Eclat Actor',
          password: hashPassword('actor2026'),
          role: 'ADMIN',
        },
        {
          email: 'manager@eclat.com',
          name: 'Eclat Manager',
          password: hashPassword('manager2026'),
          role: 'MANAGER',
        },
        {
          email: 'photographer@eclat.com',
          name: 'Eclat Photographer',
          password: hashPassword('photo2026'),
          role: 'PHOTOGRAPHER',
        }
      ];

      for (const u of defaultUsers) {
        await prisma.user.create({ data: u });
      }
      console.log('Seeded database with default users successfully.');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

export async function loginUser(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // Auto-seed on first authentication check if DB is empty
    try {
      await seedDatabaseIfNeeded();
    } catch (seedErr) {
      console.warn('Skipping auto-seed in loginUser:', seedErr.message);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user || !user.password) {
      return { success: false, error: 'Invalid email or password.' };
    }

    let isValid = false;
    try {
      isValid = verifyPassword(password, user.password);
    } catch (passErr) {
      console.error('Password validation error:', passErr);
      return { success: false, error: 'Authentication processing failed.' };
    }

    if (!isValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    return { success: false, error: 'Internal server error: ' + (error.message || error) };
  }
}

export async function updateAdminCredentials(userId, newEmail, newPassword) {
  try {
    if (!userId) {
      return { success: false, error: 'Unauthorized.' };
    }

    // Find the user to ensure it exists and is an ADMIN
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only the Actor (Admin) can update credentials.' };
    }

    const updateData = {};
    if (newEmail) {
      updateData.email = newEmail.toLowerCase().trim();
    }
    if (newPassword) {
      updateData.password = hashPassword(newPassword);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Email address is already in use by another account.' };
    }
    return { success: false, error: 'Internal server error occurred.' };
  }
}

export async function uploadImage(formData) {
  try {
    const file = formData.get('file');
    if (!file) {
      return { success: false, error: 'No file selected.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Path to public/uploads
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Format a unique file name
    const ext = path.extname(file.name) || '.jpg';
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `${Date.now()}-${cleanName}${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Save the file buffer
    await fs.writeFile(filePath, buffer);

    return { success: true, url: `/uploads/${filename}` };
  } catch (error) {
    console.error('Error in uploadImage action:', error);
    return { success: false, error: error.message || 'Failed to upload image.' };
  }
}

export async function submitInquiry(name, email, message) {
  try {
    if (!name || !email || !message) {
      return { success: false, error: 'All fields are required.' };
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        message,
      },
    });

    return { success: true, inquiry };
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    return { success: false, error: 'Internal server error occurred while saving inquiry.' };
  }
}

export async function getInquiries(userId) {
  try {
    if (!userId) {
      return { success: false, error: 'Unauthorized.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
      return { success: false, error: 'Unauthorized: Only admin or managers can view inquiries.' };
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, inquiries };
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return { success: false, error: 'Failed to retrieve inquiries.' };
  }
}
