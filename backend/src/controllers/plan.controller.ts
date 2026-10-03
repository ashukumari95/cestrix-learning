import { Request, Response } from 'express';
import * as PlanService from '../services/plan.service';

export const createPlan = async (req: Request, res: Response) => {
  try {
    const plan = await PlanService.createPlan(req.body);
    return res.status(201).json(plan);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await PlanService.getPlans();
    return res.status(200).json(plans);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await PlanService.getPlanById(req.params.id as string);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    return res.status(200).json(plan);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const plan = await PlanService.updatePlan(req.params.id as string, req.body);
    return res.status(200).json(plan);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
