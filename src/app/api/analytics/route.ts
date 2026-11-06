import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CefrLevel } from '@/types';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  const userId = session.userId;

  // 1. Fetch all student attempts
  const attempts = await prisma.studentAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          level: true,
        },
      },
    },
  });

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.isCorrect).length;
  const accuracyPercentage = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // 2. Fetch topic progress
  const progressRecords = await prisma.studentTopicProgress.findMany({
    where: { userId },
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          level: true,
        },
      },
    },
  });

  const masteredCount = progressRecords.filter((p) => p.isMastered).length;
  const bottleneckCount = progressRecords.filter((p) => p.isBottleneck).length;

  // 3. Breakdown by CEFR Level
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const levelStats: Record<CefrLevel, { total: number; correct: number; masteredTopics: number }> = {
    A1: { total: 0, correct: 0, masteredTopics: 0 },
    A2: { total: 0, correct: 0, masteredTopics: 0 },
    B1: { total: 0, correct: 0, masteredTopics: 0 },
    B2: { total: 0, correct: 0, masteredTopics: 0 },
  };

  attempts.forEach((a) => {
    const lvl = a.topic.level as CefrLevel;
    if (levelStats[lvl]) {
      levelStats[lvl].total += 1;
      if (a.isCorrect) levelStats[lvl].correct += 1;
    }
  });

  progressRecords.forEach((p) => {
    const lvl = p.topic.level as CefrLevel;
    if (levelStats[lvl] && p.isMastered) {
      levelStats[lvl].masteredTopics += 1;
    }
  });

  // 4. Global benchmark (ranking percent compared to all students in DB)
  const allAttempts = await prisma.studentAttempt.findMany({
    select: { userId: true, isCorrect: true },
  });

  // Calculate other users' average accuracies
  const userStatsMap: Record<string, { total: number; correct: number }> = {};
  allAttempts.forEach((att) => {
    if (!userStatsMap[att.userId]) userStatsMap[att.userId] = { total: 0, correct: 0 };
    userStatsMap[att.userId].total += 1;
    if (att.isCorrect) userStatsMap[att.userId].correct += 1;
  });

  const allAccuracies = Object.values(userStatsMap).map((s) =>
    s.total > 0 ? (s.correct / s.total) * 100 : 0
  );

  const lowerCount = allAccuracies.filter((acc) => acc < accuracyPercentage).length;
  const benchmarkPercent =
    allAccuracies.length > 1
      ? Math.round((lowerCount / (allAccuracies.length - 1)) * 100)
      : 80;

  return NextResponse.json({
    summary: {
      totalAttempts,
      correctAttempts,
      accuracyPercentage,
      masteredCount,
      bottleneckCount,
      benchmarkPercent,
      currentLevel: session.currentLevel,
    },
    levelStats,
    recentAttempts: attempts.slice(0, 15).map((a) => ({
      id: a.id,
      topicTitle: a.topic.title,
      topicLevel: a.topic.level,
      isCorrect: a.isCorrect,
      studentAnswer: a.studentAnswer,
      createdAt: a.createdAt,
    })),
  });
}

