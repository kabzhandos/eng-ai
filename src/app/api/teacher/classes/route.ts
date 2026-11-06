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

  const classes = await prisma.class.findMany({
    where: { teacherId: session.userId },
    include: {
      members: {
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              currentLevel: true,
              topicProgress: {
                where: { isBottleneck: true },
                include: { topic: { select: { title: true, level: true } } },
              },
              attempts: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: { isCorrect: true, createdAt: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Доступ разрешен только учителям' }, { status: 403 });
  }

  const { name } = await req.json();
  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: 'Название класса обязательно' }, { status: 400 });
  }

  // Generate unique invite code
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

