import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  
  const orgId = "cestrix-org-123";

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: orgId },
    update: {
      name: "Brilliant Physics Coaching",
    },
    create: {
      id: orgId,
      name: "Brilliant Physics Coaching",
      contactEmail: "contact@brilliantphysics.com",
      contactPhone: "9876543210",
      status: "ACTIVE"
    }
  });
  console.log(`✓ Organization: ${org.name}`);

  // 2. Create Branch
  const branchId = "main-branch-1";
  const branch = await prisma.branch.upsert({
    where: { id: branchId },
    update: {},
    create: {
      id: branchId,
      organizationId: org.id,
      name: "Main Campus",
      city: "Patna",
      state: "Bihar"
    }
  });
  console.log(`✓ Branch: ${branch.name}`);

  // 3. Create Academic Year
  const academicYearId = "ay-2025-26";
  const ay = await prisma.academicYear.upsert({
    where: { id: academicYearId },
    update: {},
    create: {
      id: academicYearId,
      organizationId: org.id,
      name: "2025-26",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31")
    }
  });

  // 4. Create Board & Class
  const boardCbse = await prisma.board.upsert({
    where: { id: "cbse-board" },
    update: {},
    create: { id: "cbse-board", name: "CBSE" }
  });

  const class11 = await prisma.classLevel.upsert({
    where: { id: "class-11" },
    update: {},
    create: { id: "class-11", boardId: boardCbse.id, name: "Class 11" }
  });

  const class12 = await prisma.classLevel.upsert({
    where: { id: "class-12" },
    update: {},
    create: { id: "class-12", boardId: boardCbse.id, name: "Class 12" }
  });

  // 5. Create Batches
  const batchJee = await prisma.batch.upsert({
    where: { id: "batch-jee-26" },
    update: {},
    create: {
      id: "batch-jee-26",
      branchId: branch.id,
      academicYearId: ay.id,
      classId: class11.id,
      name: "Target JEE 2026",
      capacity: 50
    }
  });

  const batchNeet = await prisma.batch.upsert({
    where: { id: "batch-neet-26" },
    update: {},
    create: {
      id: "batch-neet-26",
      branchId: branch.id,
      academicYearId: ay.id,
      classId: class11.id,
      name: "NEET Foundation",
      capacity: 40
    }
  });

  const batchBoard = await prisma.batch.upsert({
    where: { id: "batch-board-12" },
    update: {},
    create: {
      id: "batch-board-12",
      branchId: branch.id,
      academicYearId: ay.id,
      classId: class12.id,
      name: "Board Toppers XII",
      capacity: 35
    }
  });
  console.log(`✓ Batches created`);

  // 6. Create Admin / Teachers
  const brilliantAdmin = await prisma.user.upsert({
    where: { id: "user-admin-brilliant" },
    update: {
      email: "admin@brilliantphysics.com",
    },
    create: {
      id: "user-admin-brilliant",
      organizationId: org.id,
      branchId: branch.id,
      name: "Rahul Sharma",
      email: "admin@brilliantphysics.com",
      passwordHash: "hashed_password_here",
      roleEnum: "COACHING_ADMIN",
      isActive: true,
      teacherProfile: {
        create: {
          employeeId: "EMP001",
          qualification: "M.Sc. Physics",
          specialization: "Physics"
        }
      }
    }
  });
  
  const physicsTeacher = await prisma.user.upsert({
    where: { email: "vikram@cestrix.com" },
    update: {},
    create: {
      id: "user-teacher-vikram",
      organizationId: org.id,
      branchId: branch.id,
      name: "Vikram Singh",
      email: "vikram@cestrix.com",
      passwordHash: "hashed_password_here",
      roleEnum: "TEACHER",
      isActive: true,
      teacherProfile: {
        create: {
          employeeId: "EMP002",
          qualification: "B.Tech IIT Delhi",
          specialization: "Physics"
        }
      }
    }
  });
  console.log(`✓ Teachers created`);

  // 7. Create Parents & Students
  const parent1 = await prisma.user.upsert({
    where: { email: "rajesh.gupta@email.com" },
    update: {},
    create: {
      id: "parent-rajesh",
      organizationId: org.id,
      name: "Rajesh Gupta",
      email: "rajesh.gupta@email.com",
      phone: "9800000001",
      passwordHash: "pass",
      roleEnum: "PARENT",
      parentProfile: {
        create: { occupation: "Software Engineer" }
      }
    }
  });

  const student1 = await prisma.user.upsert({
    where: { email: "sneha.gupta@student.com" },
    update: {},
    create: {
      id: "student-sneha",
      organizationId: org.id,
      branchId: branch.id,
      name: "Sneha Gupta",
      email: "sneha.gupta@student.com",
      passwordHash: "pass",
      roleEnum: "STUDENT",
      studentProfile: {
        create: {
          studentType: "OFFLINE",
          enrollmentNo: "ENR2025001",
          classId: class11.id,
          guardians: {
            create: { name: "Rajesh Gupta", relation: "Father", phone: "9800000001" }
          },
          batches: {
            create: { batchId: batchJee.id }
          }
        }
      }
    }
  });

  const student2 = await prisma.user.upsert({
    where: { email: "rohit.sharma@student.com" },
    update: {},
    create: {
      id: "student-rohit",
      organizationId: org.id,
      branchId: branch.id,
      name: "Rohit Sharma",
      email: "rohit.sharma@student.com",
      passwordHash: "pass",
      roleEnum: "STUDENT",
      studentProfile: {
        create: {
          studentType: "HYBRID",
          enrollmentNo: "ENR2025002",
          classId: class11.id,
          batches: {
            create: { batchId: batchJee.id }
          }
        }
      }
    }
  });

  const student3 = await prisma.user.upsert({
    where: { email: "anjali.mehta@student.com" },
    update: {},
    create: {
      id: "student-anjali",
      organizationId: org.id,
      branchId: branch.id,
      name: "Anjali Mehta",
      email: "anjali.mehta@student.com",
      passwordHash: "pass",
      roleEnum: "STUDENT",
      studentProfile: {
        create: {
          studentType: "ONLINE",
          enrollmentNo: "ENR2025003",
          classId: class11.id,
          batches: {
            create: { batchId: batchNeet.id }
          }
        }
      }
    }
  });
  console.log(`✓ Students & Parents created`);

  // 8. Create Courses
  const course1 = await prisma.course.upsert({
    where: { id: "course-physics-11" },
    update: {},
    create: {
      id: "course-physics-11",
      organizationId: org.id,
      title: "Class 11 Physics Mastery",
      description: "Complete physics syllabus for class 11 CBSE and JEE Main",
      price: 2999.00,
      isPublished: true,
      modules: {
        create: [
          {
            name: "Kinematics", order: 1,
            chapters: {
              create: [
                { name: "Motion in a straight line", order: 1 }
              ]
            }
          }
        ]
      }
    }
  });

  const course2 = await prisma.course.upsert({
    where: { id: "course-math-12" },
    update: {},
    create: {
      id: "course-math-12",
      organizationId: org.id,
      title: "Class 12 Board Topper Mathematics",
      description: "Target 100/100 in CBSE boards",
      price: 1999.00,
      isPublished: true
    }
  });
  console.log(`✓ Courses created for Brilliant Physics Coaching`);

  // ============================================================================
  // 9. Create DK Mathematics Coaching (Second Tenant)
  // ============================================================================
  console.log('--- Creating second organization: DK Mathematics Coaching ---');
  
  const org2Id = "cestrix-org-dkmath";
  const org2 = await prisma.organization.upsert({
    where: { id: org2Id },
    update: {
      name: "DK Mathematics Coaching",
    },
    create: {
      id: org2Id,
      name: "DK Mathematics Coaching",
      contactEmail: "contact@dkmaths.com",
      contactPhone: "9876543211",
      status: "ACTIVE"
    }
  });
  console.log(`✓ Organization: ${org2.name}`);

  const branch2Id = "dkmath-branch-1";
  const branch2 = await prisma.branch.upsert({
    where: { id: branch2Id },
    update: {},
    create: {
      id: branch2Id,
      organizationId: org2.id,
      name: "DK Maths Main Center",
      city: "Delhi",
      state: "Delhi"
    }
  });
  console.log(`✓ Branch: ${branch2.name}`);

  // Admin for DK Mathematics
  const dkMathAdmin = await prisma.user.upsert({
    where: { id: "user-admin-dkmath" },
    update: {
      email: "dkmishra@dkmaths.com",
    },
    create: {
      id: "user-admin-dkmath",
      organizationId: org2.id,
      branchId: branch2.id,
      name: "DK Mishra (Maths)",
      email: "dkmishra@dkmaths.com",
      passwordHash: "hashed_password_here",
      roleEnum: "COACHING_ADMIN",
      isActive: true,
    }
  });
  console.log(`✓ Admin for DK Maths created (dkmishra@dkmaths.com)`);

  // A course for DK Mathematics
  const courseDk = await prisma.course.upsert({
    where: { id: "course-dk-jee-maths" },
    update: {},
    create: {
      id: "course-dk-jee-maths",
      organizationId: org2.id,
      title: "JEE Advanced Mathematics",
      description: "Advanced calculus and algebra by DK Mishra",
      price: 4999.00,
      isPublished: true
    }
  });
  console.log(`✓ Courses created for DK Maths`);

  console.log('Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
