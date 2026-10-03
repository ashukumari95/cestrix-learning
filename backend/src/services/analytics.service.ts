import prisma from '../config/prisma';

export const updateTopicMastery = async (studentId: string, topicId: string, isCorrect: boolean) => {
  const currentMastery = await prisma.topicMastery.findUnique({
    where: { studentId_topicId: { studentId, topicId } }
  });

  // Basic Algorithm: +5% for correct, -3% for wrong, max 100, min 0
  let newPct = isCorrect ? 5.0 : -3.0;
  if (currentMastery) {
    newPct += Number(currentMastery.masteryPct);
  }
  
  if (newPct > 100) newPct = 100;
  if (newPct < 0) newPct = 0;

  return await prisma.topicMastery.upsert({
    where: { studentId_topicId: { studentId, topicId } },
    update: { masteryPct: newPct },
    create: { studentId, topicId, masteryPct: newPct }
  });
};

export const getStudentAnalytics = async (studentId: string) => {
  const masteries = await prisma.topicMastery.findMany({
    where: { studentId },
    include: { topic: true }
  });
  
  const weakTopics = masteries.filter(m => Number(m.masteryPct) < 60);
  const strongTopics = masteries.filter(m => Number(m.masteryPct) >= 80);

  return { masteries, weakTopics, strongTopics };
};
