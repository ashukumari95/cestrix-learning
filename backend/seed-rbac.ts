import { PrismaClient, RoleEnum, OrgStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with RBAC and multiple organizations...');

  // 1. Create Super Admin (Global)
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'super@admin.com' },
    update: {},
    create: {
      name: 'Global Super Admin',
      email: 'super@admin.com',
      passwordHash,
      roleEnum: RoleEnum.SUPER_ADMIN,
    },
  });
  console.log('✅ Super Admin created: super@admin.com / password123');

  // 2. Create Organization 1: Cestrix Academy
  const org1 = await prisma.organization.upsert({
    where: { domain: 'cestrix.com' },
    update: {},
    create: {
      name: 'Cestrix Academy',
      domain: 'cestrix.com',
      contactEmail: 'contact@cestrix.com',
      contactPhone: '1234567890',
      status: OrgStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@cestrix.com' },
    update: {},
    create: {
      name: 'Cestrix Admin',
      email: 'admin@cestrix.com',
      passwordHash,
      roleEnum: RoleEnum.COACHING_ADMIN,
      organizationId: org1.id,
    },
  });
  console.log('✅ Org 1 Admin created: admin@cestrix.com / password123');

  await prisma.user.upsert({
    where: { email: 'teacher@cestrix.com' },
    update: {},
    create: {
      name: 'Cestrix Teacher',
      email: 'teacher@cestrix.com',
      passwordHash,
      roleEnum: RoleEnum.TEACHER,
      organizationId: org1.id,
      teacherProfile: { create: { bio: 'Math Teacher' } }
    },
  });
  console.log('✅ Org 1 Teacher created: teacher@cestrix.com / password123');

  // 3. Create Organization 2: MathOS Coaching
  const org2 = await prisma.organization.upsert({
    where: { domain: 'mathos.com' },
    update: {},
    create: {
      name: 'MathOS Coaching',
      domain: 'mathos.com',
      contactEmail: 'contact@mathos.com',
      contactPhone: '0987654321',
      status: OrgStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@mathos.com' },
    update: {},
    create: {
      name: 'MathOS Admin',
      email: 'admin@mathos.com',
      passwordHash,
      roleEnum: RoleEnum.COACHING_ADMIN,
      organizationId: org2.id,
    },
  });
  console.log('✅ Org 2 Admin created: admin@mathos.com / password123');

  await prisma.user.upsert({
    where: { email: 'teacher@mathos.com' },
    update: {},
    create: {
      name: 'MathOS Teacher',
      email: 'teacher@mathos.com',
      passwordHash,
      roleEnum: RoleEnum.TEACHER,
      organizationId: org2.id,
      teacherProfile: { create: { bio: 'Physics Teacher' } }
    },
  });
  console.log('✅ Org 2 Teacher created: teacher@mathos.com / password123');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
