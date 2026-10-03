import { Request, Response } from 'express';
import * as MistakeService from '../services/mistake.service';

export const logMistake = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.studentProfileId || req.body.studentId; // Simplified for MVP
    const { questionId, errorType } = req.body;
    const log = await MistakeService.logMistake(studentId, questionId, errorType);
    return res.status(201).json(log);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const getMyMistakes = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.studentProfileId || req.query.studentId;
    const mistakes = await MistakeService.getMistakeBook(studentId as string);
    const analysis = await MistakeService.getMistakeAnalysis(studentId as string);
    return res.status(200).json({ mistakes, analysis });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};
