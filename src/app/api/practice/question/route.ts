import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getNextQuestion } from '@/lib/services/practice-service';
import { CefrLevel } from '@/types';

export async function GET(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get('topicId');

  if (!topicId) {
    return NextResponse.json({ error: 'Параметр topicId обязателен' }, { status: 400 });
  }

  try {
    const data = await getNextQuestion(session.userId, topicId, session.currentLevel as CefrLevel);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error fetching question:', err);
    return NextResponse.json(
      { error: err.message || 'Ошибка генерации вопроса' },
      { status: 500 }
    );
  }
}

