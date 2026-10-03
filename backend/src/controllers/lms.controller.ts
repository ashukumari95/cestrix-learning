import { Request, Response } from 'express';
import * as LmsService from '../services/lms.service';
import * as UploadService from '../services/upload.service';

export const createCourse = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const course = await LmsService.createCourse(orgId, req.body);
    return res.status(201).json(course);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const courses = await LmsService.getCourses(orgId);
    return res.status(200).json(courses);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const getCourse = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const id = req.params.id as string;
    const course = await LmsService.getCourse(id, orgId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    return res.status(200).json(course);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const id = req.params.id as string;
    const course = await LmsService.updateCourse(id, orgId, req.body);
    return res.status(200).json(course);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const id = req.params.id as string;
    await LmsService.deleteCourse(id, orgId);
    return res.status(200).json({ message: 'Course deleted' });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const togglePublish = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const id = req.params.id as string;
    const course = await LmsService.togglePublish(id, orgId);
    return res.status(200).json(course);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const createHierarchy = async (req: Request, res: Response) => {
  try {
    const { type, parentId, data } = req.body;
    let result;
    if (type === 'CHAPTER') {
       throw new Error('Not implemented');
    }
    if (type === 'TOPIC') {
       throw new Error('Not implemented');
    }
    if (type === 'RESOURCE') {
       throw new Error('Not implemented');
    }
    return res.status(201).json(result);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const getPresignedUploadUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, contentType } = req.body;
    const data = await UploadService.generateUploadUrl(fileName, contentType);
    return res.status(200).json(data);
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

