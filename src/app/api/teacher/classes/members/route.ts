import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST: Add student to class by email
export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Доступ разрешен только учителям' }, { status: 403 });
  }

  try {
    const { classId, email } = await req.json();
    if (!classId || !email?.trim()) {
      return NextResponse.json({ error: 'classId и email обязательны' }, { status: 400 });
    }

    // Verify teacher owns the class
    const targetClass = await prisma.class.findFirst({
      where: { id: classId, teacherId: session.userId },
    });
    if (!targetClass) {
      return NextResponse.json({ error: 'Класс не найден или нет доступа' }, { status: 404 });
    }

    // Find student by email
    const student = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!student) {
      return NextResponse.json(
        { error: 'Ученик с таким email не найден. Проверьте правильность адреса.' },
        { status: 404 }
      );
    }

    // Check if already in class
    const existingMember = await prisma.classMember.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId: student.id,
        },
      },
    });

    if (existingMember) {
      if (existingMember.isArchived) {
        // Unarchive
        await prisma.classMember.update({
          where: { id: existingMember.id },
          data: { isArchived: false, archivedAt: null },
        });
        return NextResponse.json({ success: true, message: 'Ученик восстановлен из архива класса' });
      }
      return NextResponse.json(
        { error: 'Этот ученик уже состоит в данном классе.' },
        { status: 400 }
      );
    }

    // Add student to class
    const member = await prisma.classMember.create({
      data: {
        classId,
        studentId: student.id,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (err: any) {
    console.error('Error adding student to class:', err);
    return NextResponse.json({ error: 'Ошибка добавления ученика' }, { status: 500 });
  }
}

// PATCH: Move student to another class, or toggle student archive status
export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Доступ разрешен только учителям' }, { status: 403 });
  }

  try {
    const { classId, studentId, targetClassId, isArchived } = await req.json();
    if (!classId || !studentId) {
      return NextResponse.json({ error: 'classId и studentId обязательны' }, { status: 400 });
    }

    // Verify teacher owns the source class
    const sourceClass = await prisma.class.findFirst({
      where: { id: classId, teacherId: session.userId },
    });
    if (!sourceClass) {
      return NextResponse.json({ error: 'Исходный класс не найден' }, { status: 404 });
    }

    // Case 1: Move student to targetClassId
    if (targetClassId) {
      const targetClass = await prisma.class.findFirst({
        where: { id: targetClassId, teacherId: session.userId },
      });
      if (!targetClass) {
        return NextResponse.json({ error: 'Целевой класс не найден' }, { status: 404 });
      }

      // Check if already in target class
      const inTarget = await prisma.classMember.findUnique({
        where: { classId_studentId: { classId: targetClassId, studentId } },
      });

      if (inTarget) {
        // Just remove from source
        await prisma.classMember.delete({
          where: { classId_studentId: { classId, studentId } },
        });
        await prisma.classMember.update({
          where: { id: inTarget.id },
          data: { isArchived: false, archivedAt: null },
        });
      } else {
        // Move by deleting from old and creating in new
        await prisma.$transaction([
          prisma.classMember.delete({
            where: { classId_studentId: { classId, studentId } },
          }),
          prisma.classMember.create({
            data: {
              classId: targetClassId,
              studentId,
            },
          }),
        ]);
      }

      return NextResponse.json({ success: true, message: 'Ученик успешно перемещен в другой класс' });
    }

    // Case 2: Archive or restore student in class
    if (isArchived !== undefined) {
      await prisma.classMember.update({
        where: { classId_studentId: { classId, studentId } },
        data: {
          isArchived: Boolean(isArchived),
          archivedAt: isArchived ? new Date() : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: isArchived ? 'Ученик архивирован в классе' : 'Ученик восстановлен в классе',
      });
    }

    return NextResponse.json({ error: 'Не указано действие' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating student class member:', err);
    return NextResponse.json({ error: 'Ошибка изменения статуса ученика' }, { status: 500 });
  }
}

// DELETE: Remove student from class (e.g. accidental student)
export async function DELETE(req: Request) {
  const session = await getCurrentUser();
  if (!session || session.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Доступ разрешен только учителям' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');
  const studentId = searchParams.get('studentId');

  if (!classId || !studentId) {
    return NextResponse.json({ error: 'classId и studentId обязательны' }, { status: 400 });
  }

  // Verify teacher owns the class
  const existingClass = await prisma.class.findFirst({
    where: { id: classId, teacherId: session.userId },
  });
  if (!existingClass) {
    return NextResponse.json({ error: 'Класс не найден' }, { status: 404 });
  }

  const member = await prisma.classMember.findUnique({
    where: { classId_studentId: { classId, studentId } },
  });
  if (!member) {
    return NextResponse.json({ error: 'Ученик не найден в этом классе' }, { status: 404 });
  }

  await prisma.classMember.delete({
    where: { id: member.id },
  });

  return NextResponse.json({ success: true, message: 'Ученик удален из класса' });
}
