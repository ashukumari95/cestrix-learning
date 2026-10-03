import { GoogleGenAI, Type } from '@google/genai';
import prisma from '../config/prisma';
import { AIOperationType } from '@prisma/client';

// Initialize the new standard genai SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System instructions to act as a strict mathematics tutor
const MATH_TUTOR_PROMPT = `
You are DK Mishra's AI Mathematics Assistant. You guide students step-by-step.
Do NOT give direct final answers unless explicitly asked.
If asked for a hint, provide only the next logical step or formula needed.
Identify common mistakes (e.g. Sign Error, Formula Error) if a student provides their wrong solution.
Use LaTeX format for math formulas.
`;

const logUsage = async (
  organizationId: string | undefined, 
  userId: string | undefined, 
  operationType: AIOperationType, 
  response: any
) => {
  if (!organizationId) return;
  const tokens = response.usageMetadata?.totalTokenCount || 0;
  if (tokens > 0) {
    try {
      await prisma.$transaction([
        prisma.aIUsageLog.create({
          data: {
            organizationId,
            userId,
            operationType,
            tokensUsed: tokens,
            metadata: response.usageMetadata
          }
        }),
        prisma.organization.update({
          where: { id: organizationId },
          data: { aiUsageTokens: { increment: tokens } }
        })
      ]);
    } catch (err) {
      console.error('Failed to log AI usage', err);
    }
  }
};

export const getMathHint = async (questionText: string, studentAttempt?: string, orgId?: string, userId?: string) => {
  const prompt = `Question: ${questionText}\nStudent Attempt: ${studentAttempt || 'None'}\n\nProvide a small hint to help the student proceed.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { systemInstruction: MATH_TUTOR_PROMPT }
  });
  await logUsage(orgId, userId, AIOperationType.DOUBT_SOLVE, response);
  return response.text;
};

export const getStepByStepSolution = async (questionText: string, orgId?: string, userId?: string) => {
  const prompt = `Provide a detailed step-by-step solution for the following math question. Explain the concepts used.\n\nQuestion: ${questionText}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { systemInstruction: MATH_TUTOR_PROMPT }
  });
  await logUsage(orgId, userId, AIOperationType.DOUBT_SOLVE, response);
  return response.text;
};

export const analyzeMistake = async (questionText: string, studentSolution: string, orgId?: string, userId?: string) => {
  const prompt = `Question: ${questionText}\nStudent Solution: ${studentSolution}\n\nAnalyze the student's solution. Identify if the mistake is a 'Concept Error', 'Formula Error', 'Calculation Mistake', 'Sign Mistake', or 'Silly Mistake'. Explain exactly where they went wrong.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { systemInstruction: MATH_TUTOR_PROMPT }
  });
  await logUsage(orgId, userId, AIOperationType.DOUBT_SOLVE, response);
  return response.text;
};

export const generateSimilarQuestions = async (questionText: string, count: number = 3, orgId?: string, userId?: string) => {
  const prompt = `Generate ${count} similar mathematics questions based on the concept of this original question. Provide them in JSON format.\n\nOriginal Question: ${questionText}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { 
      systemInstruction: MATH_TUTOR_PROMPT,
      responseMimeType: 'application/json' 
    }
  });
  await logUsage(orgId, userId, AIOperationType.QUESTION_GEN, response);
  return JSON.parse(response.text || '[]');
};

export const generateQuestionsWithAI = async (
  topic: string,
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  count: number,
  questionType: 'MULTIPLE_CHOICE' | 'SUBJECTIVE' = 'MULTIPLE_CHOICE',
  orgId?: string,
  userId?: string
) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in the .env file. Please add it to use AI features.');
  }

  const prompt = `Generate ${count} distinct ${difficulty} level ${questionType} questions about "${topic}". The content should be highly academic, accurate and proper. Avoid repeating questions.`;
  
  let responseSchema: any;

  if (questionType === 'MULTIPLE_CHOICE') {
    responseSchema = {
      type: Type.ARRAY,
      description: "List of multiple choice questions",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The question text" },
          difficulty: { type: Type.STRING, description: "EASY, MEDIUM, or HARD" },
          type: { type: Type.STRING, description: "MULTIPLE_CHOICE" },
          marks: { type: Type.NUMBER, description: "Marks for this question" },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 2-3 relevant tags/keywords" 
          },
          options: {
            type: Type.ARRAY,
            description: "Exactly 4 options for the question",
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Option text" },
                isCorrect: { type: Type.BOOLEAN, description: "Whether this is the correct option (only 1 should be true)" }
              },
              required: ["text", "isCorrect"]
            }
          }
        },
        required: ["text", "difficulty", "type", "marks", "options", "tags"]
      }
    };
  } else {
    // Subjective questions
    responseSchema = {
      type: Type.ARRAY,
      description: "List of subjective questions",
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The question text" },
          difficulty: { type: Type.STRING, description: "EASY, MEDIUM, or HARD" },
          type: { type: Type.STRING, description: "SUBJECTIVE" },
          marks: { type: Type.NUMBER, description: "Marks for this question (e.g. 5 or 10)" },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 2-3 relevant tags/keywords" 
          }
        },
        required: ["text", "difficulty", "type", "marks", "tags"]
      }
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    await logUsage(orgId, userId, AIOperationType.QUESTION_GEN, response);
    const generatedQuestions = JSON.parse(response.text);
    return generatedQuestions;
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

export const chatWithAITutor = async (
  message: string, 
  studentId: string, 
  sessionId?: string, 
  orgId?: string, 
  userId?: string
) => {
  let session;
  if (sessionId) {
    session = await prisma.aISession.findUnique({
      where: { id: sessionId },
    });
  }
  
  if (!session) {
    session = await prisma.aISession.create({
      data: { studentId },
    });
  }

  // Save user message
  await prisma.aIMessage.create({
    data: { sessionId: session.id, role: 'user', content: message }
  });

  // Re-fetch messages
  const allMessages = await prisma.aIMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: 'asc' }
  });

  // Format for genai
  const contents = allMessages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: { systemInstruction: MATH_TUTOR_PROMPT }
  });

  const replyText = response.text || '';

  // Save model message
  await prisma.aIMessage.create({
    data: { sessionId: session.id, role: 'model', content: replyText }
  });

  await logUsage(orgId, userId, AIOperationType.DOUBT_SOLVE, response);

  return { reply: replyText, sessionId: session.id };
};

