import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Fetch student's flagged questions (or for a teacher viewing a student)
export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requestedStudentId = searchParams.get('studentId');

  let studentId = session.userId;

  // Teachers can query for a specific student
  if (requestedStudentId && session.role === 'TEACHER') {
    studentId = requestedStudentId;
  }

  const flags = await prisma.teacherQuestionFlag.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    include: {
      topic: {
        select: { id: true, title: true, level: true },
      },
    },
  });

  return NextResponse.json({
    flags: flags.map((f) => ({
      id: f.id,
      topicId: f.topicId,
      topicTitle: f.topic.title,
      topicLevel: f.topic.level,
      questionText: f.questionText,
      studentAnswer: f.studentAnswer,
      correctAnswer: f.correctAnswer,
      explanation: f.explanation,
      studentComment: f.studentComment,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
    })),
  });
}

// POST: Flag a question with "Спросить учителя"
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      topicId,
      questionText,
      studentAnswer,
      correctAnswer,
      explanation,
      studentComment,
    } = body;

    if (!topicId || !questionText) {
      return NextResponse.json(
        { error: 'topicId и questionText обязательны' },
        { status: 400 }
      );
    }

    // Check if duplicate flag already exists for this exact question and student
    const existing = await prisma.teacherQuestionFlag.findFirst({
      where: {
        studentId: session.userId,
        topicId,
        questionText,
      },
    });

    if (existing) {
      // Update note or comment if re-submitted
      const updated = await prisma.teacherQuestionFlag.update({
        where: { id: existing.id },
        data: {
          studentComment: studentComment || existing.studentComment,
          studentAnswer: studentAnswer || existing.studentAnswer,
          correctAnswer: correctAnswer || existing.correctAnswer,
          explanation: explanation || existing.explanation,
          status: 'PENDING',
        },
      });
      return NextResponse.json({ success: true, flag: updated, updated: true });
    }

    const flag = await prisma.teacherQuestionFlag.create({
      data: {
        studentId: session.userId,
        topicId,
        questionText,
        studentAnswer: studentAnswer || '',
        correctAnswer: correctAnswer || '',
        explanation: explanation || null,
        studentComment: studentComment || 'Требуется разбор с учителем',
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, flag, created: true });
  } catch (err: any) {
    console.error('Error creating question flag:', err);
    return NextResponse.json({ error: 'Ошибка сохранения пометки' }, { status: 500 });
  }
}

// PATCH: Update status (e.g. mark as RESOLVED or add teacher note)
export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { flagId, status, studentComment } = await req.json();
    if (!flagId) {
      return NextResponse.json({ error: 'flagId обязателен' }, { status: 400 });
    }

    const flag = await prisma.teacherQuestionFlag.findUnique({
      where: { id: flagId },
    });
    if (!flag) {
      return NextResponse.json({ error: 'Пометка не найдена' }, { status: 404 });
    }

    // Students can only update their own flags; teachers can update any student's flags
    if (session.role !== 'TEACHER' && flag.studentId !== session.userId) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
    }

    const updated = await prisma.teacherQuestionFlag.update({
      where: { id: flagId },
      data: {
        status: status || flag.status,
        studentComment: studentComment !== undefined ? studentComment : flag.studentComment,
      },
    });

    return NextResponse.json({ success: true, flag: updated });
  } catch (err: any) {
    console.error('Error updating question flag:', err);
    return NextResponse.json({ error: 'Ошибка обновления пометки' }, { status: 500 });
  }
}

// DELETE: Remove a flag
export async function DELETE(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const flagId = searchParams.get('flagId');
  if (!flagId) {
    return NextResponse.json({ error: 'flagId обязателен' }, { status: 400 });
  }

  const flag = await prisma.teacherQuestionFlag.findUnique({
    where: { id: flagId },
  });
  if (!flag) {
    return NextResponse.json({ error: 'Пометка не найдена' }, { status: 404 });
  }

  if (session.role !== 'TEACHER' && flag.studentId !== session.userId) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  await prisma.teacherQuestionFlag.delete({
    where: { id: flagId },
  });

  return NextResponse.json({ success: true });
}
