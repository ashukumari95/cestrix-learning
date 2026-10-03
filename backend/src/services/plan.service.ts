import prisma from '../config/prisma';

export const createPlan = async (data: any) => {
  return await prisma.subscriptionPlan.create({
    data,
  });
};

export const getPlans = async () => {
  return await prisma.subscriptionPlan.findMany();
};

export const getPlanById = async (id: string) => {
  return await prisma.subscriptionPlan.findUnique({
    where: { id },
  });
};

export const updatePlan = async (id: string, data: any) => {
  return await prisma.subscriptionPlan.update({
    where: { id },
    data,
  });
};
