import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getOrganizationSettings = async (organizationId: string) => {
  let org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      settings: true,
      branches: true,
    }
  });

  if (!org) throw new Error('Organization not found');

  if (!org.settings) {
    const settings = await prisma.organizationSettings.create({
      data: {
        organizationId,
        branding: { primaryColor: '#1a5dc9', logoUrl: '' },
        features: { enableBiometric: false, enableAI: true }
      }
    });
    org.settings = settings;
  }

  return org;
};

export const updateOrganizationSettings = async (organizationId: string, data: any) => {
  const { name, contactEmail, contactPhone, branding, features } = data;

  const org = await prisma.organization.update({
    where: { id: organizationId },
    data: {
      name,
      contactEmail,
      contactPhone,
      settings: {
        upsert: {
          create: { branding, features },
          update: { branding, features }
        }
      }
    },
    include: { settings: true }
  });

  return org;
};

export const getRoles = async (organizationId: string) => {
  return prisma.role.findMany({
    where: {
      OR: [
        { organizationId },
        { isSystem: true }
      ]
    },
    include: {
      permissions: {
        include: { permission: true }
      },
      _count: {
        select: { users: true }
      }
    }
  });
};

export const createRole = async (organizationId: string, name: string) => {
  return prisma.role.create({
    data: {
      organizationId,
      name,
      isSystem: false,
    }
  });
};
