import prisma from '../config/prisma';

export const getTests = async (organizationId: string) => {
  return prisma.test.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { questions: true, attempts: true }
      }
    }
  });
};

export const getTestById = async (testId: string, organizationId: string) => {
  return prisma.test.findUnique({
    where: { id: testId, organizationId },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: {
              question: {
                include: { options: true, tags: true, attachments: true }
              }
            }
          }
        }
      }
    }
  });
};

export const createTest = async (organizationId: string, data: any) => {
  const test = await prisma.test.create({
    data: {
      organizationId,
      title: data.title,
      durationMins: data.durationMins || 60,
      totalMarks: data.totalMarks || 100,
      isPublished: data.isPublished || false,
    }
  });

  if (data.sections && Array.isArray(data.sections)) {
    for (const sec of data.sections) {
      const createdSection = await prisma.testSection.create({
        data: {
          testId: test.id,
          name: sec.name,
          order: sec.order
        }
      });
      if (sec.questions && Array.isArray(sec.questions)) {
        for (const q of sec.questions) {
          await prisma.testQuestion.create({
            data: {
              testId: test.id,
              questionId: q.id,
              sectionId: createdSection.id,
              order: q.order
            }
          });
          // Update question marks
          if (q.marks !== undefined || q.negativeMarks !== undefined) {
            await prisma.question.update({
              where: { id: q.id },
              data: {
                marks: q.marks !== undefined ? Number(q.marks) : undefined,
                negativeMarks: q.negativeMarks !== undefined ? Number(q.negativeMarks) : undefined,
              }
            });
          }
        }
      }
    }
  }

  return test;
};

export const updateTest = async (testId: string, organizationId: string, data: any) => {
  const updateData: any = {
    title: data.title,
    durationMins: data.durationMins,
    totalMarks: data.totalMarks,
    isPublished: data.isPublished,
  };

  if (data.sections && Array.isArray(data.sections)) {
    // Delete existing sections and questions mappings
    await prisma.testQuestion.deleteMany({ where: { testId } });
    await prisma.testSection.deleteMany({ where: { testId } });

    for (const sec of data.sections) {
      const createdSection = await prisma.testSection.create({
        data: {
          testId,
          name: sec.name,
          order: sec.order
        }
      });
      if (sec.questions && Array.isArray(sec.questions)) {
        for (const q of sec.questions) {
          await prisma.testQuestion.create({
            data: {
              testId,
              questionId: q.id,
              sectionId: createdSection.id,
              order: q.order
            }
          });
          // Update question marks
          if (q.marks !== undefined || q.negativeMarks !== undefined) {
            await prisma.question.update({
              where: { id: q.id },
              data: {
                marks: q.marks !== undefined ? Number(q.marks) : undefined,
                negativeMarks: q.negativeMarks !== undefined ? Number(q.negativeMarks) : undefined,
              }
            });
          }
        }
      }
    }
  }

  return prisma.test.update({
    where: { id: testId, organizationId },
    data: updateData
  });
};

export const deleteTest = async (testId: string, organizationId: string) => {
  return prisma.test.delete({
    where: { id: testId, organizationId }
  });
};

export const submitTest = async (studentId: string, testId: string, answers: { questionId: string, isCorrect: boolean }[]) => {
  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { questions: { include: { question: true } } }
  });

  if (!test) throw new Error('Test not found');

  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let score = 0;

  for (const ans of answers) {
    const qData = test.questions.find(tq => tq.questionId === ans.questionId)?.question;
    const pMarks = qData?.marks ? Number(qData.marks) : 4;
    const nMarks = qData?.negativeMarks ? Number(qData.negativeMarks) : 1;

    if (ans.isCorrect === true) {
      correctCount++;
      score += pMarks;
    }
    else if (ans.isCorrect === false) {
      wrongCount++;
      score -= nMarks;
    }
    else {
      skippedCount++;
    }
  }

  const accuracy = correctCount > 0 ? (correctCount / (correctCount + wrongCount)) * 100 : 0;

  const attempt = await prisma.testAttempt.create({
    data: {
      testId,
      studentId,
      endTime: new Date(),
      score,
      percentile: accuracy, // Placeholder for percentile
    }
  });

  return attempt;
};

export const saveAttemptProgress = async (studentId: string, testId: string, progressData: any) => {
  return { status: 'Saved successfully', timestamp: new Date() };
};

export const assignTestToBatches = async (
  testId: string,
  organizationId: string,
  batchIds: string[],
  startDate?: string,
  endDate?: string
) => {
  // First, verify the test belongs to the organization
  const test = await prisma.test.findUnique({
    where: { id: testId, organizationId },
  });

  if (!test) {
    throw new Error('Test not found or unauthorized');
  }

  // Use a transaction to create multiple BatchTest assignments
  const assignments = await prisma.$transaction(
    batchIds.map((batchId) => {
      return prisma.batchTest.upsert({
        where: {
          batchId_testId: { batchId, testId }
        },
        update: {
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
        create: {
          batchId,
          testId,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        }
      });
    })
  );

  return assignments;
};

export const getTestResults = async (testId: string, organizationId: string) => {
  const test = await prisma.test.findUnique({
    where: { id: testId, organizationId },
    include: {
      attempts: {
        include: {
          student: {
            include: {
              user: {
                select: { name: true, email: true, phone: true }
              }
            }
          },
          answers: {
            include: {
              question: {
                include: {
                  topic: true
                }
              }
            }
          }
        },
        orderBy: { score: 'desc' }
      }
    }
  });

  if (!test) throw new Error('Test not found');

  // Calculate weak topics
  const topicStats: Record<string, { name: string, total: number, correct: number }> = {};

  test.attempts.forEach(attempt => {
    attempt.answers.forEach(answer => {
      if (answer.question && answer.question.topic) {
        const topicId = answer.question.topic.id;
        const topicName = answer.question.topic.name;
        if (!topicStats[topicId]) {
          topicStats[topicId] = { name: topicName, total: 0, correct: 0 };
        }
        topicStats[topicId].total += 1;
        if (answer.isCorrect) {
          topicStats[topicId].correct += 1;
        }
      }
    });
  });

  const topicAnalysis = Object.values(topicStats).map(stat => ({
    name: stat.name,
    accuracy: (stat.correct / stat.total) * 100
  })).sort((a, b) => a.accuracy - b.accuracy);

  const attemptsWithoutAnswers = test.attempts.map(a => {
    const { answers, ...rest } = a;
    return rest;
  });

  return { 
    testTitle: test.title, 
    totalMarks: test.totalMarks, 
    attempts: attemptsWithoutAnswers,
    topicAnalysis
  };
};
