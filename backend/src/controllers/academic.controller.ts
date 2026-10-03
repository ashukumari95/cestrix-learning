import { Request, Response } from 'express';
import * as AcademicService from '../services/academic.service';

export const createClass = async (req: Request, res: Response) => {
  try {
    const { boardId, name } = req.body;
    const newClass = await AcademicService.createClass(boardId, name);
    return res.status(201).json(newClass);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getClasses = async (req: Request, res: Response) => {
  try {
    const boardId = req.query.boardId as string;
    const classes = await AcademicService.getClasses(boardId);
    return res.status(200).json(classes);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createBatch = async (req: Request, res: Response) => {
  try {
    const batch = await AcademicService.createBatch(req.body);
    return res.status(201).json(batch);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBatches = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const branchId = req.query.branchId as string;
    const batches = await AcademicService.getBatches(orgId, branchId);
    return res.status(200).json(batches);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
