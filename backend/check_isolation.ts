import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true, contactEmail: true }
  });
  console.log('\n=== ORGANIZATIONS ===');
  orgs.forEach((o: any) => console.log(`  [${o.id}] ${o.name} | ${o.contactEmail}`));

  const admins = await prisma.user.findMany({
    where: { roleEnum: 'COACHING_ADMIN' },
    select: { id: true, name: true, email: true, organizationId: true }
  });
  console.log('\n=== COACHING ADMINS ===');
  admins.forEach((a: any) => console.log(`  ${a.email} | org: ${a.organizationId} | ${a.name}`));

  const students = await prisma.user.findMany({
    where: { roleEnum: 'STUDENT' },
    select: { name: true, organizationId: true }
  });
  console.log('\n=== ALL STUDENTS (name | orgId) ===');
  students.forEach((s: any) => console.log(`  ${s.name} | ${s.organizationId}`));

  // Per-org isolation check
  const brilliantStudents = await prisma.user.findMany({
    where: { roleEnum: 'STUDENT', organizationId: 'cestrix-org-123' },
    select: { name: true }
  });
  console.log('\n=== Brilliant Physics Students ===');
  brilliantStudents.length === 0
    ? console.log('  (none)')
    : brilliantStudents.forEach((s: any) => console.log('  ', s.name));

  const dkStudents = await prisma.user.findMany({
    where: { roleEnum: 'STUDENT', organizationId: 'cestrix-org-dkmath' },
    select: { name: true }
  });
  console.log('\n=== DK Maths Students ===');
  dkStudents.length === 0
    ? console.log('  (none - no students seeded for DK Maths)')
    : dkStudents.forEach((s: any) => console.log('  ', s.name));

  // Cross-org leak check
  console.log('\n=== ISOLATION CHECK ===');
  const leak = students.filter((s: any) =>
    s.organizationId !== 'cestrix-org-123' && s.organizationId !== 'cestrix-org-dkmath'
  );
  if (leak.length === 0) {
    console.log('  ✅ No data leaks found — all students belong to a known org.');
  } else {
    console.log('  ⚠️  Students with unexpected orgIds:', leak);
  }

  await prisma.$disconnect();
}

main().catch((e: any) => { console.error(e); process.exit(1); });
