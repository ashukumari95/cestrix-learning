import prisma from '../config/prisma';
import { RoleEnum } from '@prisma/client';
import bcrypt from 'bcrypt';

export const createUser = async (data: any, roleEnum: RoleEnum, organizationId: string) => {
  const { profileData, passwordHash, batchId, address, guardians, history, ...userData } = data;
  
  const createData: any = {
    ...userData,
    roleEnum,
    organizationId,
  };

  if (passwordHash) {
    createData.passwordHash = await bcrypt.hash(passwordHash, 10);
  } else {
    createData.passwordHash = await bcrypt.hash('default123', 10);
  }

  if (roleEnum === RoleEnum.STUDENT) {
    const studentProfileData: any = { ...(profileData || {}) };

    if (address) {
      studentProfileData.address = { create: address };
    }
    if (guardians && guardians.length > 0) {
      studentProfileData.guardians = { create: guardians };
    }
    if (history && history.length > 0) {
      studentProfileData.history = { create: history };
    }

    createData.studentProfile = { create: studentProfileData };
  } else if (roleEnum === RoleEnum.TEACHER) {
    createData.teacherProfile = { create: profileData || {} };
  } else if (roleEnum === RoleEnum.PARENT) {
    createData.parentProfile = { create: profileData || {} };
  }

  const user = await prisma.user.create({ data: createData });

  // Enroll in batch if provided (for students)
  if (roleEnum === RoleEnum.STUDENT && batchId) {
    const sp = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (sp) {
      await prisma.studentBatch.create({
        data: { studentId: sp.id, batchId },
      });
    }
  }

  return user;
};


export const getStudents = async (organizationId: string) => {
  return await prisma.user.findMany({
    where: { organizationId, roleEnum: RoleEnum.STUDENT },
    include: {
      studentProfile: {
        include: {
          batches: { include: { batch: true } },
          classLevel: true,
        }
      }
    }
  });
};

export const getTeachers = async (organizationId: string) => {
  return await prisma.user.findMany({
    where: { organizationId, roleEnum: RoleEnum.TEACHER },
    include: {
      teacherProfile: true
    }
  });
};

export const getParents = async (organizationId: string) => {
  return await prisma.user.findMany({
    where: { organizationId, roleEnum: RoleEnum.PARENT },
    include: {
      parentProfile: true
    }
  });
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      studentProfile: {
        include: {
          classLevel: true,
          batches: { include: { batch: { include: { branch: true } } } },
          guardians: true,
          address: true,
          documents: true,
          history: true,
          attendances: {
            orderBy: { date: 'desc' },
            take: 30
          },
          studentFees: {
            include: {
              installments: {
                include: {
                  payments: true
                }
              }
            }
          }
        }
      },
      teacherProfile: {
        include: {
          batches: { include: { batch: true } },
        }
      },
      parentProfile: true,
    }
  });
};

