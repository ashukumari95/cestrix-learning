import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dynamic CRUD Controller
export class GenericController {
  
  static async getAll(req: Request, res: Response) {
    try {
      const modelName = req.params.modelName as string;
      const model = (prisma as any)[modelName];
      if (!model) {
        return res.status(404).json({ error: `Model ${modelName} not found in Prisma` });
      }
      
      // Basic filtering based on query params
      const filters = { ...req.query };
      // Delete complex query params if any (like pagination)
      delete filters.skip;
      delete filters.take;

      const data = await model.findMany({
        where: filters,
        skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
        take: req.query.take ? parseInt(req.query.take as string) : undefined,
      });
      
      res.status(200).json({ success: true, count: data.length, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const modelName = req.params.modelName as string;
      const id = req.params.id as string;
      const model = (prisma as any)[modelName];
      if (!model) return res.status(404).json({ error: `Model ${modelName} not found` });

      const data = await model.findUnique({
        where: { id }
      });
      
      if (!data) return res.status(404).json({ success: false, error: 'Record not found' });
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const modelName = req.params.modelName as string;
      const model = (prisma as any)[modelName];
      if (!model) return res.status(404).json({ error: `Model ${modelName} not found` });

      const data = await model.create({
        data: req.body
      });
      
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const modelName = req.params.modelName as string;
      const id = req.params.id as string;
      const model = (prisma as any)[modelName];
      if (!model) return res.status(404).json({ error: `Model ${modelName} not found` });

      const data = await model.update({
        where: { id },
        data: req.body
      });
      
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const modelName = req.params.modelName as string;
      const id = req.params.id as string;
      const model = (prisma as any)[modelName];
      if (!model) return res.status(404).json({ error: `Model ${modelName} not found` });

      await model.delete({
        where: { id }
      });
      
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
