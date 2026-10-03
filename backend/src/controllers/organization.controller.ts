import { Request, Response } from 'express';
import * as OrgService from '../services/organization.service';

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const org = await OrgService.createOrganization(req.body);
    return res.status(201).json(org);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const orgs = await OrgService.getOrganizations();
    return res.status(200).json(orgs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const org = await OrgService.getOrganizationById(req.params.id as string);
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    return res.status(200).json(org);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const org = await OrgService.updateOrganization(req.params.id as string, req.body);
    return res.status(200).json(org);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const org = await OrgService.deleteOrganization(req.params.id as string);
    return res.status(200).json({ message: 'Organization suspended', org });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
