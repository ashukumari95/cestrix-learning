import { PrismaClient, AttendanceStatus, AttendanceType } from '@prisma/client';

const prisma = new PrismaClient();

export class AttendanceService {
  async getBatchAttendance(batchId: string, dateStr: string) {
    const date = new Date(dateStr);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // Get all students in the batch
    const batchStudents = await prisma.studentBatch.findMany({
      where: { batchId },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            batches: {
              where: { batchId },
              include: { batch: { select: { name: true } } }
            }
          }
        }
      }
    });

    // Get attendance records for these students on this date
    const studentIds = batchStudents.map(bs => bs.studentId);
    
    const attendances = await prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    // Map the records
    return batchStudents.map(bs => {
      const record = attendances.find(a => a.studentId === bs.studentId);
      return {
        studentId: bs.studentId,
        name: bs.student.user.name,
        email: bs.student.user.email,
        batchName: bs.student.batches[0]?.batch.name || 'Unknown',
        attendanceId: record?.id || null,
        status: record?.status || null,
        remarks: record?.remarks || ''
      };
    });
  }

  async markBatchAttendance(
    batchId: string, 
    dateStr: string, 
    records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
  ) {
    const targetDate = new Date(dateStr);
    targetDate.setHours(12, 0, 0, 0); // standardize to noon to avoid timezone shift

    const results = await prisma.$transaction(async (tx) => {
      const updated = [];
      for (const record of records) {
        // Upsert logic because of unique constraint: studentId, date, sessionId
        // Since sessionId is null, we have to find first or create
        
        // Let's find if a record exists for this date and student
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existing = await tx.attendance.findFirst({
          where: {
            studentId: record.studentId,
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });

        if (existing) {
          const res = await tx.attendance.update({
            where: { id: existing.id },
            data: { status: record.status, remarks: record.remarks || existing.remarks }
          });
          updated.push(res);
        } else {
          const res = await tx.attendance.create({
            data: {
              studentId: record.studentId,
              date: targetDate,
              status: record.status,
              type: AttendanceType.MANUAL,
              remarks: record.remarks || ''
            }
          });
          updated.push(res);
        }
      }
      return updated;
    });

    return results;
  }

  async getAttendanceStats(organizationId: string, dateStr: string) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get all attendances for the organization on this date
    // To do this we have to go through student -> user -> organizationId
    const records = await prisma.attendance.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        student: { user: { organizationId } }
      }
    });

    const totalMarked = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const leave = records.filter(r => r.status === 'LEAVE').length;

    return { totalMarked, present, absent, late, leave };
  }
}
