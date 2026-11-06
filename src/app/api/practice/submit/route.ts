import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { submitStudentAnswer } from '@/lib/services/practice-service';

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { topicId, questionPayload, studentAnswer } = await req.json();

    if (!topicId || !questionPayload || studentAnswer === undefined) {
      return NextResponse.json(
        { error: 'Неверные параметры запроса' },
        { status: 400 }
      );
    }

    const result = await submitStudentAnswer({
      userId: session.userId,
      topicId,
      questionPayload,
      studentAnswer,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error submitting answer:', err);
    return NextResponse.json(
      { error: err.message || 'Ошибка обработки ответа' },
      { status: 500 }
    );
  }
}

