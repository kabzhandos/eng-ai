import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const topics = await prisma.grammarTopic.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      progressRecords: {
        where: { userId: session.userId },
      },
    },
  });

  const formatted = topics.map((t) => {
    const progress = t.progressRecords[0] || null;
    return {
      id: t.id,
      level: t.level,
      title: t.title,
      slug: t.slug,
      description: t.description,
      orderIndex: t.orderIndex,
      isMastered: progress?.isMastered ?? false,
      isBottleneck: progress?.isBottleneck ?? false,
      consecutiveCorrect: progress?.consecutiveCorrect ?? 0,
      totalAttempts: progress?.totalAttempts ?? 0,
      failedAttempts: progress?.failedAttempts ?? 0,
    };
  });

  return NextResponse.json({ topics: formatted });
}

