import prisma from '../config/prisma';

export const createOrganization = async (data: any) => {
  return await prisma.organization.create({
    data,
  });
};

export const getOrganizations = async () => {
  return await prisma.organization.findMany({
    include: { subscription: true },
  });
};

export const getOrganizationById = async (id: string) => {
  return await prisma.organization.findUnique({
    where: { id },
    include: { subscription: true },
  });
};

export const updateOrganization = async (id: string, data: any) => {
  return await prisma.organization.update({
    where: { id },
    data,
  });
};

export const deleteOrganization = async (id: string) => {
  // In SaaS, soft delete or status suspension is preferred over hard delete.
  // Here we update status to 'Suspended' instead of hard delete.
  return await prisma.organization.update({
    where: { id },
    data: { status: 'SUSPENDED' },
  });
};
