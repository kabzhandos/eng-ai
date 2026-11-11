import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  const session = await getCurrentUser();
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Доступ разрешен только учителям' }, { status: 403 });
  }

  // 1. Fetch all grammar topics for reference
  const allTopics = await prisma.grammarTopic.findMany({
    orderBy: { orderIndex: 'asc' },
    select: { id: true, title: true, level: true, slug: true },
  });

  // 2. Fetch teacher's classes with full student stats
  const classes = await prisma.class.findMany({
    where: { teacherId: session.userId },
    include: {
      focusTopic: {
        select: { id: true, title: true, level: true },
      },
      members: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              currentLevel: true,
              createdAt: true,
              topicProgress: {
                include: {
                  topic: {
                    select: { id: true, title: true, level: true },
                  },
                },
              },
              attempts: {
                orderBy: { createdAt: 'desc' },
                take: 30,
                select: {
                  id: true,
                  topicId: true,
                  isCorrect: true,
                  studentAnswer: true,
                  questionPayload: true,
                  aiExplanation: true,
                  createdAt: true,
                  topic: { select: { title: true, level: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 3. Enrich classes with metrics (blindspots, student risk scores, focus topic completion)
  const formattedClasses = classes.map((cls) => {
    const errorMap: Record<string, { topicTitle: string; topicLevel: string; errorCount: number; studentCount: Set<string> }> = {};

    let totalStudents = cls.members.length;
    let focusCompletedCount = 0;

    const formattedStudents = cls.members.map(({ student, joinedAt }) => {
      const totalAttempts = student.attempts.length;
      const correctAttempts = student.attempts.filter((a) => a.isCorrect).length;
      const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

      const bottlenecks = student.topicProgress
        .filter((p) => p.isBottleneck)
        .map((p) => ({
          topicId: p.topic.id,
          title: p.topic.title,
          level: p.topic.level,
          failedAttempts: p.failedAttempts,
        }));

      const mastered = student.topicProgress.filter((p) => p.isMastered);

      // Check if student completed class focus topic
      if (cls.focusTopicId) {
        const focusProg = student.topicProgress.find((p) => p.topicId === cls.focusTopicId);
        if (focusProg?.isMastered) {
          focusCompletedCount++;
        }
      }

      // Aggregate class errors
      student.attempts
        .filter((a) => !a.isCorrect)
        .forEach((a) => {
          if (!errorMap[a.topicId]) {
            errorMap[a.topicId] = {
              topicTitle: a.topic.title,
              topicLevel: a.topic.level,
              errorCount: 0,
              studentCount: new Set(),
            };
          }
          errorMap[a.topicId].errorCount++;
          errorMap[a.topicId].studentCount.add(student.id);
        });

      // Calculate risk status
      let riskStatus: 'high' | 'medium' | 'low' = 'low';
      if (bottlenecks.length >= 2 || (totalAttempts >= 5 && accuracy < 50)) {
        riskStatus = 'high';
      } else if (bottlenecks.length === 1 || (totalAttempts >= 5 && accuracy < 65)) {
        riskStatus = 'medium';
      }

      return {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        currentLevel: student.currentLevel,
        joinedAt,
        totalAttempts,
        accuracy,
        masteredCount: mastered.length,
        bottlenecks,
        riskStatus,
        recentAttempts: student.attempts.slice(0, 10).map((att) => ({
          id: att.id,
          isCorrect: att.isCorrect,
          studentAnswer: att.studentAnswer,
          topicTitle: att.topic.title,
          topicLevel: att.topic.level,
          aiExplanation: att.aiExplanation,
          createdAt: att.createdAt,
        })),
        topicProgress: student.topicProgress.map((tp) => ({
          topicId: tp.topicId,
          title: tp.topic.title,
          level: tp.topic.level,
          isMastered: tp.isMastered,
          isBottleneck: tp.isBottleneck,
          totalAttempts: tp.totalAttempts,
          failedAttempts: tp.failedAttempts,
        })),
      };
    });

    // Compute top 3 class blindspots
    const blindspots = Object.values(errorMap)
      .map((item) => ({
        topicTitle: item.topicTitle,
        topicLevel: item.topicLevel,
        errorCount: item.errorCount,
        affectedStudents: item.studentCount.size,
        percentAffected: totalStudents > 0 ? Math.round((item.studentCount.size / totalStudents) * 100) : 0,
      }))
      .sort((a, b) => b.affectedStudents - a.affectedStudents || b.errorCount - a.errorCount)
      .slice(0, 3);

    // Dynamic AI lesson advice
    let aiLessonAdvice = '';
    if (blindspots.length > 0) {
      aiLessonAdvice = `Внимание: тема «${blindspots[0].topicTitle} (${blindspots[0].topicLevel})» вызывает сложности у ${blindspots[0].percentAffected}% учеников класса. Рекомендуется провести 10-минутную разминку с акцентом на сигнальные слова.`;
    } else {
      aiLessonAdvice = 'Все темы в группе осваиваются стабильно. Можно переходить к усложненным конструкциям следующего уровня.';
    }

    return {
      id: cls.id,
      name: cls.name,
      inviteCode: cls.inviteCode,
      createdAt: cls.createdAt,
      focusTopic: cls.focusTopic,
      focusTopicId: cls.focusTopicId,
      focusCompletedCount,
      totalStudents,
      blindspots,
      aiLessonAdvice,
      students: formattedStudents,
    };
  });

  return NextResponse.json({
    classes: formattedClasses,
    allTopics,
  });
}

// POST: Create new class
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Доступ разрешен только учителям' }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: 'Название класса обязательно' }, { status: 400 });
  }

  let inviteCode = generateInviteCode();
  while (await prisma.class.findUnique({ where: { inviteCode } })) {
    inviteCode = generateInviteCode();
  }

  const newClass = await prisma.class.create({
    data: {
      name: name.trim(),
      inviteCode,
      teacherId: session.userId,
    },
  });

  return NextResponse.json({ success: true, class: newClass });
}

// PATCH: Update class settings (e.g. set or change focusTopicId)
export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Доступ разрешен только учителям' }, { status: 403 });
  }

  try {
    const { classId, focusTopicId } = await req.json();
    if (!classId) {
      return NextResponse.json({ error: 'classId обязателен' }, { status: 400 });
    }

    const updated = await prisma.class.update({
      where: {
        id: classId,
        teacherId: session.userId,
      },
      data: {
        focusTopicId: focusTopicId || null,
      },
    });

    return NextResponse.json({ success: true, class: updated });
  } catch (err: any) {
    console.error('Error updating class focus topic:', err);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}
