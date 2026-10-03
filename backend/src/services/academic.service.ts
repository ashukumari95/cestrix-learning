import prisma from '../config/prisma';

export const createClass = async (boardId: string, name: string) => {
  return await prisma.classLevel.create({ data: { name, boardId } });
};

export const getClasses = async (boardId: string) => {
  return await prisma.classLevel.findMany({ where: { boardId } });
};

export const createBoard = async (name: string, description?: string) => {
  return await prisma.board.create({ data: { name, description } });
};

export const getBoards = async () => {
  return await prisma.board.findMany({});
};

export const createSubject = async (classId: string, name: string, code?: string) => {
  return await prisma.subject.create({ data: { name, classId, code } });
};

export const getSubjects = async (classId: string) => {
  return await prisma.subject.findMany({ where: { classId } });
};

export const createBatch = async (data: any) => {
  return await prisma.batch.create({ data });
};

export const getBatches = async (organizationId: string, branchId?: string) => {
  return await prisma.batch.findMany({ 
    where: { 
      branch: { organizationId },
      ...(branchId ? { branchId } : {})
    }, 
    include: { 
      classLevel: { include: { board: true } }, 
      branch: true,
      students: true,
      teachers: { include: { teacher: { include: { user: true } } } }
    } 
  });
};
