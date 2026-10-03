import { Request, Response } from 'express';
import * as AnalyticsService from '../services/analytics.service';

export const getMyAnalytics = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.studentProfileId || req.query.studentId;
    const analytics = await AnalyticsService.getStudentAnalytics(studentId as string);
    return res.status(200).json(analytics);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};
