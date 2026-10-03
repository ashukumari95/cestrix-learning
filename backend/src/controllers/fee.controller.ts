import { Request, Response } from 'express';
import * as FeeService from '../services/fee.service';

export const getFeeStructures = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const feeStructures = await FeeService.getFeeStructures(orgId);
    return res.status(200).json(feeStructures);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createFeeStructure = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const { name, amount } = req.body;
    const feeStructure = await FeeService.createFeeStructure(orgId, { name, amount });
    return res.status(201).json(feeStructure);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getStudentFees = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const { studentId } = req.query;
    const fees = await FeeService.getStudentFees(orgId, studentId as string | undefined);
    return res.status(200).json(fees);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const assignFeeToStudent = async (req: Request, res: Response) => {
  try {
    const { studentId, feeStructureId, totalAmount, installments } = req.body;
    const studentFee = await FeeService.assignFeeToStudent(studentId, feeStructureId, totalAmount, installments);
    return res.status(201).json(studentFee);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { installmentId, amount } = req.body;
    const payment = await FeeService.recordPayment(installmentId, amount);
    return res.status(201).json(payment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
