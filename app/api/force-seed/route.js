import prisma from '@/src/lib/db';
import { hashPassword } from '@/src/lib/auth';

export async function GET() {
  try {
    const email = 'actor@eclat.com';
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          name: 'Eclat Actor',
          password: hashPassword('actor2026'),
          role: 'ADMIN',
        },
      });
      return Response.json({ success: true, message: "Admin seeded into live database successfully!" });
    }

    return Response.json({ success: true, message: "Admin user already exists." });
  } catch (error) {
    console.error('Error seeding admin:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
