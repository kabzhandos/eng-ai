import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, TOKEN_COOKIE_NAME } from '@/lib/auth';
import { Role, CefrLevel } from '@/types';

export async function POST(req: Request) {
  try {
    const { email, password, fullName, role, inviteCode } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже зарегистрирован.' },
        { status: 400 }
      );
    }

    const userRole: Role = role === 'TEACHER' ? 'TEACHER' : 'STUDENT';
    const passwordHash = await hashPassword(password);

    // If inviteCode is provided for student, find the class
    let targetClass = null;
    if (inviteCode && userRole === 'STUDENT') {
      targetClass = await prisma.class.findUnique({
        where: { inviteCode: inviteCode.trim().toUpperCase() },
      });
      if (!targetClass) {
        return NextResponse.json(
          { error: 'Класс с таким инвайт-кодом не найден.' },
          { status: 404 }
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        role: userRole,
        currentLevel: 'A1',
      },
    });

    // If registered with invite code, join class
    if (targetClass && userRole === 'STUDENT') {
      await prisma.classMember.create({
        data: {
          classId: targetClass.id,
          studentId: user.id,
        },
      });
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as Role,
      currentLevel: user.currentLevel as CefrLevel,
    };

    const token = await createSessionToken(sessionData);

    const res = NextResponse.json({ success: true, user: sessionData });
    res.cookies.set(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Ошибка при регистрации' }, { status: 500 });
  }
}

