import { Request, Response } from 'express';
import * as DashboardService from '../services/dashboard.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const stats = await DashboardService.getDashboardStats(orgId);
    return res.status(200).json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
