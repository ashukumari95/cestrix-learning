import prisma from '../config/prisma';

export const createCourse = async (organizationId: string, data: any) => {
  return await prisma.course.create({
    data: {
      organizationId,
      title: data.name || data.title,
      description: data.description,
      price: data.price ? parseFloat(data.price) : 0,
      validityDays: data.validityDays ? parseInt(data.validityDays) : null,
      isPublished: data.status === 'PUBLISHED',
      modules: data.modules && data.modules.length > 0 ? {
        create: data.modules.map((m: any, mIdx: number) => ({
          name: m.title,
          order: mIdx,
          chapters: {
            create: (m.chapters || []).map((c: any, cIdx: number) => ({
              name: c.title,
              order: cIdx,
              lessons: {
                create: (c.lessons || []).map((l: any, lIdx: number) => ({
                  title: l.title,
                  order: lIdx,
                  resources: l.url ? {
                    create: [{ title: l.title, type: l.type || 'VIDEO', url: l.url }]
                  } : undefined
                }))
              }
            }))
          }
        }))
      } : undefined
    }
  });
};

export const getCourses = async (organizationId: string) => {
  return await prisma.course.findMany({
    where: { organizationId },
    include: {
      modules: {
        include: {
          chapters: {
            include: {
              lessons: { include: { resources: true } }
            }
          }
        }
      },
      enrollments: { select: { id: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getCourse = async (id: string, organizationId: string) => {
  return await prisma.course.findUnique({
    where: { id, organizationId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          chapters: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
                include: { resources: true, progress: true }
              }
            }
          }
        }
      },
      enrollments: true,
    }
  });
};

export const updateCourse = async (id: string, organizationId: string, data: any) => {
  const course = await prisma.course.update({
    where: { id, organizationId },
    data: {
      title: data.title || data.name,
      description: data.description,
      price: data.price !== undefined ? parseFloat(data.price) : undefined,
      validityDays: data.validityDays ? parseInt(data.validityDays) : undefined,
      isPublished: data.isPublished,
    }
  });

  if (data.modules && Array.isArray(data.modules)) {
    const moduleIds = data.modules.map((m: any) => m.id).filter((mid: string) => mid && !mid.startsWith('m'));
    await prisma.courseModule.deleteMany({
      where: { courseId: id, id: { notIn: moduleIds } }
    });

    for (let mIdx = 0; mIdx < data.modules.length; mIdx++) {
      const m = data.modules[mIdx];
      const isNewModule = !m.id || m.id.startsWith('m');
      
      const module = await prisma.courseModule.upsert({
        where: { id: isNewModule ? '00000000-0000-0000-0000-000000000000' : m.id },
        create: { courseId: id, name: m.title || m.name, order: mIdx },
        update: { name: m.title || m.name, order: mIdx }
      });

      if (m.chapters && Array.isArray(m.chapters)) {
        const chapterIds = m.chapters.map((c: any) => c.id).filter((cid: string) => cid && !cid.startsWith('c'));
        await prisma.courseChapter.deleteMany({
          where: { moduleId: module.id, id: { notIn: chapterIds } }
        });

        for (let cIdx = 0; cIdx < m.chapters.length; cIdx++) {
          const c = m.chapters[cIdx];
          const isNewChapter = !c.id || c.id.startsWith('c');
          
          const chapter = await prisma.courseChapter.upsert({
            where: { id: isNewChapter ? '00000000-0000-0000-0000-000000000000' : c.id },
            create: { moduleId: module.id, name: c.title || c.name, order: cIdx },
            update: { name: c.title || c.name, order: cIdx }
          });

          if (c.lessons && Array.isArray(c.lessons)) {
            const lessonIds = c.lessons.map((l: any) => l.id).filter((lid: string) => lid && !lid.startsWith('l'));
            await prisma.lesson.deleteMany({
              where: { chapterId: chapter.id, id: { notIn: lessonIds } }
            });

            for (let lIdx = 0; lIdx < c.lessons.length; lIdx++) {
              const l = c.lessons[lIdx];
              const isNewLesson = !l.id || l.id.startsWith('l');
              
              const lesson = await prisma.lesson.upsert({
                where: { id: isNewLesson ? '00000000-0000-0000-0000-000000000000' : l.id },
                create: { chapterId: chapter.id, title: l.title, order: lIdx },
                update: { title: l.title, order: lIdx }
              });

              if (l.url) {
                const existingResources = await prisma.resource.findMany({ where: { lessonId: lesson.id } });
                const existingResource = existingResources[0];
                if (existingResource) {
                  await prisma.resource.update({
                    where: { id: existingResource.id },
                    data: { title: l.title, type: l.type || 'VIDEO', url: l.url }
                  });
                } else {
                  await prisma.resource.create({
                    data: { lessonId: lesson.id, title: l.title, type: l.type || 'VIDEO', url: l.url }
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return course;
};

export const deleteCourse = async (id: string, organizationId: string) => {
  return await prisma.course.delete({ where: { id, organizationId } });
};

export const togglePublish = async (id: string, organizationId: string) => {
  const course = await prisma.course.findUnique({ where: { id, organizationId }, select: { isPublished: true } });
  if (!course) throw new Error('Course not found');
  return await prisma.course.update({
    where: { id },
    data: { isPublished: !course.isPublished }
  });
};

