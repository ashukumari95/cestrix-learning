import { Request, Response } from 'express';
import * as AIService from '../services/ai.service';

export const getHint = async (req: Request, res: Response) => {
  try {
    const { questionText, studentAttempt } = req.body;
    const hint = await AIService.getMathHint(questionText, studentAttempt, (req as any).user?.organizationId, (req as any).user?.id);
    return res.status(200).json({ hint });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const getSolution = async (req: Request, res: Response) => {
  try {
    const { questionText } = req.body;
    const solution = await AIService.getStepByStepSolution(questionText, (req as any).user?.organizationId, (req as any).user?.id);
    return res.status(200).json({ solution });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const analyzeStudentMistake = async (req: Request, res: Response) => {
  try {
    const { questionText, studentSolution } = req.body;
    const analysis = await AIService.analyzeMistake(questionText, studentSolution, (req as any).user?.organizationId, (req as any).user?.id);
    return res.status(200).json({ analysis });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const getSimilarQuestions = async (req: Request, res: Response) => {
  try {
    const { questionText, count } = req.body;
    const questions = await AIService.generateSimilarQuestions(questionText, count, (req as any).user?.organizationId, (req as any).user?.id);
    return res.status(200).json({ questions });
  } catch (err: any) { return res.status(500).json({ error: err.message }); }
};

export const getAIUsageStats = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.organizationId;
    if (!orgId) return res.status(400).json({ error: "No organization attached" });
    
    const organization = await require('../config/prisma').default.organization.findUnique({
      where: { id: orgId },
      select: { aiUsageTokens: true }
    });

    const breakdown = await require('../config/prisma').default.aIUsageLog.groupBy({
      by: ['operationType'],
      where: { organizationId: orgId },
      _sum: { tokensUsed: true },
      _count: { _all: true }
    });

    const recentLogs = await require('../config/prisma').default.aIUsageLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true, roleEnum: true } } }
    });

    return res.status(200).json({
      totalTokens: organization?.aiUsageTokens || 0,
      breakdown: breakdown.map((b: any) => ({
        operationType: b.operationType,
        tokensUsed: b._sum.tokensUsed || 0,
        requests: b._count._all || 0
      })),
      recentLogs: recentLogs.map((log: any) => ({
        id: log.id,
        operationType: log.operationType,
        tokensUsed: log.tokensUsed,
        userName: log.user?.name || 'System',
        userRole: log.user?.roleEnum || 'System',
        createdAt: log.createdAt
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const chatWithAITutor = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;
    
    // Ensure the user has a StudentProfile
    const studentProfile = await require('../config/prisma').default.studentProfile.findUnique({
      where: { userId: (req as any).user?.id }
    });

    if (!studentProfile) {
      return res.status(403).json({ error: "Only students can use the AI Tutor." });
    }

    const response = await AIService.chatWithAITutor(
      message, 
      studentProfile.id, 
      sessionId, 
      (req as any).user?.organizationId, 
      (req as any).user?.id
    );
    
    return res.status(200).json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getChatSessions = async (req: Request, res: Response) => {
  try {
    const studentProfile = await require('../config/prisma').default.studentProfile.findUnique({
      where: { userId: (req as any).user?.id }
    });

    if (!studentProfile) {
      return res.status(403).json({ error: "Only students can access their AI Chat sessions." });
    }

    const sessions = await require('../config/prisma').default.aISession.findMany({
      where: { studentId: studentProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'asc' } // To get the first message as title
        }
      }
    });

    return res.status(200).json({ sessions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // Ensure student owns this session
    const studentProfile = await require('../config/prisma').default.studentProfile.findUnique({
      where: { userId: (req as any).user?.id }
    });

    if (!studentProfile) {
      return res.status(403).json({ error: "Not authorized." });
    }

    const session = await require('../config/prisma').default.aISession.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.studentId !== studentProfile.id) {
      return res.status(404).json({ error: "Session not found." });
    }

    const messages = await require('../config/prisma').default.aIMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json({ messages });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
