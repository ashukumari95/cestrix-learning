import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Remove the wrongly-placed DK Mishra account from Brilliant Physics org
  const wrongUser = await prisma.user.findFirst({
    where: { email: 'dkmishra@brilliantphysics.com' }
  });

  if (wrongUser) {
    console.log(`Found wrong account: ${wrongUser.email} | org: ${wrongUser.organizationId}`);
    await prisma.user.delete({ where: { id: wrongUser.id } });
    console.log('✅ Deleted wrong dkmishra@brilliantphysics.com account');
  } else {
    console.log('No wrong account found — already clean!');
  }

  // Also fix seed.ts admin password for brilliant physics
  // The seeded admin has "hashed_password_here" which won't work for bcrypt login
  // Let's update it to a proper hash (password: "admin123")
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const brilliantAdmin = await prisma.user.findFirst({
    where: { email: 'admin@brilliantphysics.com' }
  });
  const dkAdmin = await prisma.user.findFirst({
    where: { email: 'dkmishra@dkmaths.com' }
  });

  if (brilliantAdmin) {
    await prisma.user.update({
      where: { id: brilliantAdmin.id },
      data: { passwordHash: hashedPassword }
    });
    console.log('✅ Fixed password for admin@brilliantphysics.com → password: admin123');
  }

  if (dkAdmin) {
    await prisma.user.update({
      where: { id: dkAdmin.id },
      data: { passwordHash: hashedPassword }
    });
    console.log('✅ Fixed password for dkmishra@dkmaths.com → password: admin123');
  }

  console.log('\n=== LOGIN CREDENTIALS ===');
  console.log('Brilliant Physics: admin@brilliantphysics.com / admin123');
  console.log('DK Mathematics:    dkmishra@dkmaths.com / admin123');

  await prisma.$disconnect();
}

main().catch((e: any) => { console.error(e); process.exit(1); });
