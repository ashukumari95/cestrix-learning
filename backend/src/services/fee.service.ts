import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getFeeStructures = async (organizationId: string) => {
  return prisma.feeStructure.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { students: true }
      }
    }
  });
};

export const createFeeStructure = async (organizationId: string, data: { name: string; amount: number }) => {
  return prisma.feeStructure.create({
    data: {
      organizationId,
      name: data.name,
      amount: data.amount,
    }
  });
};

export const getStudentFees = async (organizationId: string, studentId?: string) => {
  return prisma.studentFee.findMany({
    where: {
      feeStructure: { organizationId },
      ...(studentId ? { studentId } : {})
    },
    include: {
      student: {
        include: { user: true }
      },
      feeStructure: true,
      installments: {
        include: { payments: true }
      }
    },
    orderBy: {
      id: 'desc'
    }
  });
};

export const assignFeeToStudent = async (studentId: string, feeStructureId: string, totalAmount: number, installments: { amount: number, dueDate: Date }[]) => {
  return prisma.studentFee.create({
    data: {
      studentId,
      feeStructureId,
      totalAmount,
      installments: {
        create: installments.map(inst => ({
          amount: inst.amount,
          dueDate: inst.dueDate,
          status: 'PENDING'
        }))
      }
    },
    include: {
      installments: true
    }
  });
};

export const recordPayment = async (installmentId: string, amount: number) => {
  // First create the payment
  const payment = await prisma.feePayment.create({
    data: {
      installmentId,
      amountPaid: amount,
    }
  });

  // Then check if the installment is fully paid
  const installment = await prisma.feeInstallment.findUnique({
    where: { id: installmentId },
    include: { payments: true }
  });

  if (installment) {
    const totalPaid = installment.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
    if (totalPaid >= Number(installment.amount)) {
      await prisma.feeInstallment.update({
        where: { id: installmentId },
        data: { status: 'PAID' }
      });
    }
  }

  return payment;
};
