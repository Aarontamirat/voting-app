import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; attendanceId: string }> }) {
  const { id, attendanceId } = await params;
  const meetingId = id;

  try {
    // Load meeting and attendance
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    if (meeting.status === 'CLOSED') return NextResponse.json({ error: 'Cannot modify attendance for closed meeting' }, { status: 400 });

    const attendance = await prisma.attendance.findUnique({ where: { id: attendanceId } });
    if (!attendance) return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    if (attendance.meetingId !== meetingId) return NextResponse.json({ error: 'Attendance does not belong to this meeting' }, { status: 400 });

    // We will delete attendance AND delete the representation mapping for this (meeting, representedById, shareholderId)
    // Wrap in a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Delete attendance row
      await tx.attendance.delete({ where: { id: attendanceId } });

      // If the attendance had representedById, delete the Representation row for that meeting + rep + shareholder
      if (attendance.representedById) {
        try {
          await tx.representation.deleteMany({
            where: {
              meetingId,
              representativeId: attendance.representedById,
              shareholderId: attendance.shareholderId,
            },
          });
        } catch (e) {
          // ignore, continue
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to delete attendance' }, { status: 500 });
  }
}
