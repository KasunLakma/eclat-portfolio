const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const SALT = process.env.AUTH_SALT || 'eclat-portfolio-salt-2026';

function hashPassword(password) {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

async function main() {
  console.log('Seeding database...');
  
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
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    console.log(`Upserted user: ${u.email} (${u.role})`);
  }
  
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
