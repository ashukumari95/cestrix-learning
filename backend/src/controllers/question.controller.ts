import { Request, Response } from 'express';
import * as QuestionService from '../services/question.service';
import * as AIService from '../services/ai.service';

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const question = await QuestionService.createQuestion(orgId, req.body);
    return res.status(201).json(question);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const bulkCreateQuestions = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const questions = req.body.questions;
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'questions array is required' });
    }

    const result = await QuestionService.bulkCreateQuestions(orgId, questions);
    return res.status(201).json({ message: 'Questions imported successfully', count: result.count });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const { topicId, difficulty, search, page, limit } = req.query as any;
    const result = await QuestionService.getQuestions(orgId, {
      topicId,
      difficulty,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const question = await QuestionService.getQuestionById(req.params.id as string, orgId);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    return res.status(200).json(question);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    const question = await QuestionService.updateQuestion(req.params.id as string, orgId, req.body);
    return res.status(200).json(question);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.organizationId;
    await QuestionService.deleteQuestion(req.params.id as string, orgId);
    return res.status(200).json({ message: 'Question deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Taxonomy / Dropdown endpoints
export const getBoards = async (_req: Request, res: Response) => {
  try {
    const boards = await QuestionService.getBoards();
    return res.status(200).json(boards);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSubjectsByClass = async (req: Request, res: Response) => {
  try {
    const subjects = await QuestionService.getSubjectsByClass(req.params.classId as string);
    return res.status(200).json(subjects);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTopicsByChapter = async (req: Request, res: Response) => {
  try {
    const topics = await QuestionService.getTopicsByChapter(req.params.chapterId as string);
    return res.status(200).json(topics);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await QuestionService.getCategories();
    return res.status(200).json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getTags = async (_req: Request, res: Response) => {
  try {
    const tags = await QuestionService.getTags();
    return res.status(200).json(tags);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const generateQuestionsAI = async (req: Request, res: Response) => {
  try {
    const { topic, difficulty, count, questionType } = req.body;
    
    if (!topic || !difficulty || !count) {
      return res.status(400).json({ error: 'topic, difficulty, and count are required' });
    }

    const generatedQuestions = await AIService.generateQuestionsWithAI(
      topic,
      difficulty,
      parseInt(count as string),
      questionType || 'MULTIPLE_CHOICE',
      (req as any).user?.organizationId,
      (req as any).user?.id
    );

    return res.status(200).json(generatedQuestions);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
