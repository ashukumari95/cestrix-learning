import { Request, Response } from 'express';
import * as TestService from '../services/test.service';

export const getTests = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const tests = await TestService.getTests(orgId);
    return res.status(200).json(tests);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const getTestById = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const test = await TestService.getTestById(req.params.id as string, orgId);
    if (!test) return res.status(404).json({ error: 'Test not found' });
    return res.status(200).json(test);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const createTest = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const testData = req.body;
    
    const test = await TestService.createTest(orgId, testData);
    return res.status(201).json(test);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const updateTest = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const testData = req.body;
    
    const test = await TestService.updateTest(req.params.id as string, orgId, testData);
    return res.status(200).json(test);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const deleteTest = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    await TestService.deleteTest(req.params.id as string, orgId);
    return res.status(204).send();
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const submitTest = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.studentProfileId || req.body.studentId;
    const { testId, answers } = req.body;

    const result = await TestService.submitTest(studentId, testId, answers);
    return res.status(200).json(result);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const autoSave = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.studentProfileId || req.body.studentId;
    const { testId, progressData } = req.body;

    const response = await TestService.saveAttemptProgress(studentId, testId, progressData);
    return res.status(200).json(response);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const assignTestToBatches = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const testId = req.params.id as string;
    const { batchIds, startDate, endDate } = req.body;
    
    if (!batchIds || !Array.isArray(batchIds)) {
      return res.status(400).json({ error: 'batchIds must be an array' });
    }

    const result = await TestService.assignTestToBatches(testId, orgId, batchIds, startDate, endDate);
    return res.status(200).json({ message: 'Test assigned successfully', data: result });
  } catch (err: any) { 
    return res.status(500).json({ error: err.message }); 
  }
};

export const getTestResults = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const testId = req.params.id as string;
    const results = await TestService.getTestResults(testId, orgId);
    return res.status(200).json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
