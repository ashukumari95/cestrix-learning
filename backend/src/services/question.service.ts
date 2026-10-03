import prisma from '../config/prisma';
import { DifficultyLevel } from '@prisma/client';

export const createQuestion = async (organizationId: string, data: any) => {
  const { options, tags, attachments, ...questionData } = data;
  
  let resolvedTags: {id: string}[] = [];
  if (tags && Array.isArray(tags)) {
    for (const t of tags) {
      const tagName = typeof t === 'string' ? t : (t.id || t.name);
      if (!tagName) continue;
      let tag = await prisma.questionTag.findFirst({ where: { name: tagName } });
      if (!tag) tag = await prisma.questionTag.create({ data: { name: tagName } });
      resolvedTags.push({ id: tag.id });
    }
  }

  const question = await prisma.question.create({
    data: {
      ...questionData,
      organizationId,
      ...(resolvedTags.length > 0
        ? { tags: { connect: resolvedTags } }
        : {}),
      ...(options && options.length > 0
        ? { options: { create: options } }
        : {}),
      ...(attachments && attachments.length > 0
        ? { attachments: { create: attachments } }
        : {}),
    },
    include: { options: true, tags: true, attachments: true },
  });
  return question;
};

export const bulkCreateQuestions = async (organizationId: string, questions: any[]) => {
  const results = [];
  for (const q of questions) {
    try {
      const created = await createQuestion(organizationId, q);
      results.push(created);
    } catch(err) {
      console.error('Failed to create question in bulk:', err);
    }
  }
  return { count: results.length };
};

export const getQuestions = async (
  organizationId: string,
  filters: { topicId?: string; difficulty?: DifficultyLevel; search?: string; page?: number; limit?: number }
) => {
  const { topicId, difficulty, search, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const whereClause: any = { organizationId };
  if (topicId) whereClause.topicId = topicId;
  if (difficulty) whereClause.difficulty = difficulty;
  if (search) whereClause.text = { contains: search, mode: 'insensitive' };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where: whereClause,
      include: {
        options: true,
        tags: true,
        topic: { include: { chapter: { include: { subject: { include: { class: { include: { board: true } } } } } } } },
        subtopic: true,
        concept: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.question.count({ where: whereClause }),
  ]);

  return { questions, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getQuestionById = async (id: string, organizationId: string) => {
  return await prisma.question.findFirst({
    where: { id, organizationId },
    include: { options: true, tags: true, attachments: true, topic: true, subtopic: true, concept: true, category: true },
  });
};

export const updateQuestion = async (id: string, organizationId: string, data: any) => {
  const { options, tags, attachments, ...questionData } = data;

  // Delete old options/attachments and re-create (simplest sync strategy)
  await prisma.questionOption.deleteMany({ where: { questionId: id } });
  await prisma.questionAttachment.deleteMany({ where: { questionId: id } });

  let resolvedTags: {id: string}[] = [];
  if (tags && Array.isArray(tags)) {
    for (const t of tags) {
      const tagName = typeof t === 'string' ? t : (t.id || t.name);
      if (!tagName) continue;
      let tag = await prisma.questionTag.findFirst({ where: { name: tagName } });
      if (!tag) tag = await prisma.questionTag.create({ data: { name: tagName } });
      resolvedTags.push({ id: tag.id });
    }
  }

  return await prisma.question.update({
    where: { id },
    data: {
      ...questionData,
      ...(tags
        ? { tags: { set: resolvedTags } }
        : {}),
      ...(options && options.length > 0
        ? { options: { create: options } }
        : {}),
      ...(attachments && attachments.length > 0
        ? { attachments: { create: attachments } }
        : {}),
    },
    include: { options: true, tags: true, attachments: true },
  });
};

export const deleteQuestion = async (id: string, organizationId: string) => {
  return await prisma.question.deleteMany({ where: { id, organizationId } });
};

export const createOptions = async (questionId: string, options: any[]) => {
  return await prisma.questionOption.createMany({
    data: options.map((opt) => ({ ...opt, questionId })),
  });
};

// ---- Taxonomy helpers (for dropdowns) ----

export const getBoards = async () => {
  return await prisma.board.findMany({
    include: { classes: { include: { subjects: { include: { chapters: { include: { topics: { include: { subtopics: { include: { concepts: true } } } } } } } } } } },
  });
};

export const getSubjectsByClass = async (classId: string) => {
  return await prisma.subject.findMany({ where: { classId }, include: { chapters: { include: { topics: true } } } });
};

export const getTopicsByChapter = async (chapterId: string) => {
  return await prisma.topic.findMany({ where: { chapterId }, orderBy: { order: 'asc' } });
};

export const getCategories = async () => {
  return await prisma.questionCategory.findMany();
};

export const getTags = async () => {
  return await prisma.questionTag.findMany();
};
