import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateClassAiReport } from '@/lib/ai/generator';

export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Доступ разрешен только учителям' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'Параметр classId обязателен' }, { status: 400 });
  }

  // Fetch teacher profile
  const teacher = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { fullName: true, email: true },
  });

  // Fetch class with full student data
  const targetClass = await prisma.class.findFirst({
    where: { id: classId, teacherId: session.userId },
    include: {
      focusTopic: { select: { id: true, title: true, level: true } },
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
                  topic: { select: { id: true, title: true, level: true } },
                },
              },
              attempts: {
                orderBy: { createdAt: 'desc' },
                take: 40,
                select: {
                  id: true,
                  topicId: true,
                  isCorrect: true,
                  studentAnswer: true,
                  questionPayload: true,
                  aiExplanation: true,
                  createdAt: true,
                  topic: { select: { id: true, title: true, level: true } },
                },
              },
              questionFlags: {
                orderBy: { createdAt: 'desc' },
                include: {
                  topic: { select: { id: true, title: true, level: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!targetClass) {
    return NextResponse.json({ error: 'Класс не найден или нет доступа' }, { status: 404 });
  }

  // Process and aggregate metrics
  const errorMap: Record<
    string,
    { topicTitle: string; topicLevel: string; errorCount: number; studentCount: Set<string> }
  > = {};

  let totalAttemptsCount = 0;
  let totalCorrectCount = 0;
  let totalMasteredCount = 0;
  let riskStudentsCount = 0;

  const studentRows = targetClass.members.map(({ student, joinedAt, isArchived }) => {
    const totalAttempts = student.attempts.length;
    const correctAttempts = student.attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    totalAttemptsCount += totalAttempts;
    totalCorrectCount += correctAttempts;

    const mastered = student.topicProgress.filter((p) => p.isMastered);
    totalMasteredCount += mastered.length;

    const bottlenecks = student.topicProgress.filter((p) => p.isBottleneck);

    let riskStatus: 'high' | 'medium' | 'low' = 'low';
    if (bottlenecks.length >= 2 || (totalAttempts >= 5 && accuracy < 50)) {
      riskStatus = 'high';
      riskStudentsCount++;
    } else if (bottlenecks.length === 1 || (totalAttempts >= 5 && accuracy < 70)) {
      riskStatus = 'medium';
    }

    // Collect errors for class blindspots
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
        errorMap[a.topicId].errorCount += 1;
        errorMap[a.topicId].studentCount.add(student.id);
      });

    const pendingFlags = student.questionFlags.filter((f) => f.status === 'PENDING');

    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      currentLevel: student.currentLevel,
      joinedAt: joinedAt.toISOString(),
      isArchived: Boolean(isArchived),
      totalAttempts,
      accuracy,
      masteredCount: mastered.length,
      riskStatus,
      bottlenecks: bottlenecks.map((b) => ({
        title: b.topic.title,
        level: b.topic.level,
        failedAttempts: b.failedAttempts,
      })),
      pendingFlagsCount: pendingFlags.length,
      pendingFlags: pendingFlags.map((pf) => ({
        id: pf.id,
        topicTitle: pf.topic.title,
        topicLevel: pf.topic.level,
        questionText: pf.questionText,
        studentAnswer: pf.studentAnswer,
        correctAnswer: pf.correctAnswer,
        studentComment: pf.studentComment,
        createdAt: pf.createdAt.toISOString(),
      })),
    };
  });

  const totalStudents = studentRows.length;
  const activeStudents = studentRows.filter((s) => !s.isArchived);
  const averageAccuracy =
    totalAttemptsCount > 0 ? Math.round((totalCorrectCount / totalAttemptsCount) * 100) : 0;

  // Blindspots
  const blindspots = Object.values(errorMap)
    .map((item) => ({
      topicTitle: item.topicTitle,
      topicLevel: item.topicLevel,
      errorCount: item.errorCount,
      affectedStudents: item.studentCount.size,
      percentAffected:
        totalStudents > 0 ? Math.round((item.studentCount.size / totalStudents) * 100) : 0,
    }))
    .sort((a, b) => b.affectedStudents - a.affectedStudents || b.errorCount - a.errorCount)
    .slice(0, 4);

  // All pending flags across students
  const allPendingQuestions = studentRows.flatMap((s) =>
    s.pendingFlags.map((f) => ({
      ...f,
      studentName: s.fullName,
    }))
  );

  // Generate AI Pedagogical Report via Gemini
  let aiAnalysis;
  try {
    aiAnalysis = await generateClassAiReport({
      className: targetClass.name,
      totalStudents,
      averageAccuracy,
      blindspots,
      riskStudentsCount,
      pendingQuestionsCount: allPendingQuestions.length,
    });
  } catch (err: any) {
    console.error('Failed to generate AI report:', err);
    // Fallback baseline report in case of AI service timeout
    aiAnalysis = {
      executiveSummary: `Группа «${targetClass.name}» состоит из ${totalStudents} учеников со средней точностью выполнения грамматических заданий ${averageAccuracy}%. Основное внимание на текущем этапе рекомендуется уделить закреплению пройденных базовых конструкций и разбору типичных ошибок.`,
      rootCauseAnalysis: blindspots.map((b) => ({
        topicTitle: b.topicTitle,
        topicLevel: b.topicLevel,
        pedagogicalDiagnosis: `У ${b.percentAffected}% учеников возникают затруднения в этой теме, часто вызванные недостаточным различением сигнальных слов и временных маркеров.`,
        recommendation: `Провести 10-минутное повторение темы с фокусом на контекстные подсказки и контрастные примеры.`,
      })),
      actionPlan: [
        {
          week: 'Неделя 1',
          focusArea: blindspots[0]?.topicTitle || 'Повторение пройденных правил',
          warmupActivity: 'Быстрая разминка в начале урока: фронтальный опрос по карточкам с маркерами времени.',
          keySignalsToEmphasize: 'Вспомогательные глаголы и маркеры времени (always, yesterday, since, for).',
        },
        {
          week: 'Неделя 2',
          focusArea: blindspots[1]?.topicTitle || 'Закрепление сложных конструкций',
          warmupActivity: 'Парная работа: составление предложений с исправлением намеренных грамматических ошибок.',
          keySignalsToEmphasize: 'Формы неправильных глаголов и инверсионные структуры.',
        },
      ],
      differentiationAdvice:
        'Рекомендуется разделить задания: ученикам группы риска предложить упражнения с опорой на таблицы маркеров, а сильным ученикам — задания в режиме ручного ввода текста без подсказок.',
    };
  }

  return NextResponse.json({
    reportInfo: {
      generatedAt: new Date().toISOString(),
      teacherName: teacher?.fullName || 'Преподаватель',
      teacherEmail: teacher?.email || '',
      className: targetClass.name,
      classId: targetClass.id,
      inviteCode: targetClass.inviteCode,
      isArchived: targetClass.isArchived,
      focusTopic: targetClass.focusTopic,
    },
    metrics: {
      totalStudents,
      activeStudentsCount: activeStudents.length,
      averageAccuracy,
      totalAttemptsCount,
      totalMasteredCount,
      riskStudentsCount,
      pendingQuestionsCount: allPendingQuestions.length,
    },
    blindspots,
    students: studentRows,
    pendingQuestions: allPendingQuestions,
    aiAnalysis,
  });
}

