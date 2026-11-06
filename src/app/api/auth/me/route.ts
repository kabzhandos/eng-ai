import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, CefrLevel } from '@/types';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // Refresh user level from DB
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      currentLevel: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as Role,
      currentLevel: user.currentLevel as CefrLevel,
    },
  });
}

