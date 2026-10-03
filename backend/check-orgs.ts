import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany({
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          roleEnum: true
        }
      }
    }
  });
  console.log(JSON.stringify(orgs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
