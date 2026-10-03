import prisma from '../config/prisma';
import { RoleEnum } from '@prisma/client';

export const getDashboardStats = async (organizationId: string) => {
  const totalStudents = await prisma.user.count({
    where: { organizationId, roleEnum: RoleEnum.STUDENT, isActive: true }
  });

  const activeTeachers = await prisma.user.count({
    where: { organizationId, roleEnum: RoleEnum.TEACHER, isActive: true }
  });

  const totalCourses = await prisma.course.count({
    where: { organizationId }
  });

  const batchesData = await prisma.batch.findMany({
    where: { branch: { organizationId } },
    include: {
      _count: {
        select: { students: true }
      }
    },
    take: 5
  });

  const batches = batchesData.map(b => ({
    name: b.name,
    enrolled: b._count.students,
    cap: b.capacity,
    color: '#1a5dc9'
  }));

  // Calculate Today's Attendance
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const attendances = await prisma.attendance.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      student: { user: { organizationId } }
    }
  });

  const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendances.filter(a => a.status === 'ABSENT').length;
  const todayAttendancePct = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0;

  // Calculate Pending Fees
  const pendingInstallments = await prisma.feeInstallment.findMany({
    where: {
      status: 'PENDING',
      studentFee: { feeStructure: { organizationId } }
    }
  });
  const pendingFees = pendingInstallments.reduce((sum, inst) => sum + Number(inst.amount), 0);

  // Calculate Monthly Revenue
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const feePayments = await prisma.feePayment.findMany({
    where: {
      paidAt: { gte: startOfMonth },
      installment: { studentFee: { feeStructure: { organizationId } } }
    }
  });
  const monthlyRevenue = feePayments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

  // Upcoming Tests
  const upcomingTestsRaw = await prisma.batchTest.findMany({
    where: {
      startDate: { gte: new Date() },
      test: { organizationId }
    },
    include: {
      test: true,
      batch: true
    },
    take: 3,
    orderBy: { startDate: 'asc' }
  });

  const upcomingTests = upcomingTestsRaw.map(t => ({
    name: t.test.title,
    type: 'Test',
    batch: t.batch.name,
    when: t.startDate ? new Date(t.startDate).toLocaleDateString() : 'Upcoming'
  }));

  // Top Students
  const topAttempts = await prisma.testAttempt.findMany({
    where: { test: { organizationId } },
    include: {
      student: { include: { user: true, batches: { include: { batch: true } } } }
    },
    orderBy: { score: 'desc' },
    take: 5
  });

  const topStudentsMap = new Map();
  let rank = 1;
  topAttempts.forEach(a => {
    if (!topStudentsMap.has(a.studentId) && topStudentsMap.size < 3) {
      topStudentsMap.set(a.studentId, {
        rank: rank++,
        name: a.student.user.name,
        batch: a.student.batches[0]?.batch.name || 'Unknown',
        score: a.score?.toString() || '0'
      });
    }
  });
  const topStudents = Array.from(topStudentsMap.values());

    // At Risk Students (Mock logic based on absent counts)
    const atRisk = topAttempts
      .filter(a => a.score && Number(a.score) < 40)
      .map(a => ({
        name: a.student.user.name,
        batch: a.student.batches[0]?.batch.name || 'General',
        issue: 'Low Test Scores',
        risk: 'HIGH'
      })).slice(0, 3);

    // AI Doubts
    const aiDoubts = [
      { student: 'Rahul M.', question: 'Thermodynamics Q12', topic: 'Physics', status: 'Unresolved' },
      { student: 'Sneha K.', question: 'Calculus Integration', topic: 'Maths', status: 'Resolved' },
    ];

    // Activities
    const activities = [
      { user: 'Admin', action: 'Created new batch', target: 'Target 2025', time: '1 hour ago' },
      { user: 'System', action: 'Processed Fees', target: '14 Payments', time: '2 hours ago' }
    ];

    return {
      totalStudents,
      activeTeachers,
      totalCourses,
      batches,
      todayAttendancePct,
      presentCount,
      absentCount,
      pendingFees,
      monthlyRevenue,
      upcomingTests,
      topStudents,
      atRisk,
      aiDoubts,
      activities
    };
};
