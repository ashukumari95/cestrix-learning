import { Request, Response } from 'express';
import * as UserService from '../services/user.service';
import { RoleEnum } from '@prisma/client';

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const teacher = await UserService.createUser(req.body, RoleEnum.TEACHER, orgId);
    return res.status(201).json(teacher);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const teachers = await UserService.getTeachers(orgId);
    return res.status(200).json(teachers);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const student = await UserService.createUser(req.body, RoleEnum.STUDENT, orgId);
    return res.status(201).json(student);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getStudents = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const students = await UserService.getStudents(orgId);
    return res.status(200).json(students);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createParent = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const parent = await UserService.createUser(req.body, RoleEnum.PARENT, orgId);
    return res.status(201).json(parent);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getParents = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const parents = await UserService.getParents(orgId);
    return res.status(200).json(parents);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await UserService.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const resendInvite = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // Mocking the invite logic
    return res.status(200).json({ message: 'Invite sent successfully via WhatsApp/Email' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
