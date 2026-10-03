import prisma from '../config/prisma';

export const logMistake = async (studentId: string, questionId: string, errorType: string) => {
  return await prisma.mistakeLog.create({
    data: { studentId, questionId, errorType }
  });
};

export const getMistakeBook = async (studentId: string) => {
  return await prisma.mistakeLog.findMany({
    where: { studentId },
    include: {
      question: {
        include: { topic: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getMistakeAnalysis = async (studentId: string) => {
  const mistakes = await prisma.mistakeLog.groupBy({
    by: ['errorType'],
    where: { studentId },
    _count: { errorType: true }
  });
  return mistakes.map(m => ({ errorType: m.errorType, count: m._count.errorType }));
};
