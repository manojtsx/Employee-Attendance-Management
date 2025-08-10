import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      name: 'System Administrator',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  });

  // Create sample employee
  const hashedEmployeePassword = await bcrypt.hash('employee123', 10);
  
  const employee = await prisma.user.upsert({
    where: { email: 'employee@company.com' },
    update: {},
    create: {
      email: 'employee@company.com',
      name: 'John Employee',
      password: hashedEmployeePassword,
      role: 'EMPLOYEE',
    },
  });

  // Set a default office location (San Francisco coordinates)
  const officeLocation = await prisma.officeLocation.create({
    data: {
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 100,
    },
  });

  console.log('Seed data created:');
  console.log('Admin:', { email: admin.email, password: 'admin123' });
  console.log('Employee:', { email: employee.email, password: 'employee123' });
  console.log('Office Location:', officeLocation);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });