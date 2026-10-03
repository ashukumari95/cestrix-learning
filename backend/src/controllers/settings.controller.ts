import { Request, Response } from 'express';
import * as SettingsService from '../services/settings.service';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const settings = await SettingsService.getOrganizationSettings(orgId);
    return res.status(200).json(settings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const updated = await SettingsService.updateOrganizationSettings(orgId, req.body);
    return res.status(200).json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const roles = await SettingsService.getRoles(orgId);
    return res.status(200).json(roles);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const { name } = req.body;
    const role = await SettingsService.createRole(orgId, name);
    return res.status(201).json(role);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
