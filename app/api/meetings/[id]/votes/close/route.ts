import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const meetingId = params.id;
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) throw new Error('Meeting not found');
      if (meeting.status === 'CLOSED') throw new Error('Meeting already closed');

      // Mark meeting as CLOSED
      const u = await tx.meeting.update({ where: { id: meetingId }, data: { status: 'CLOSED' } });
      return u;
    });

    return NextResponse.json({ ok: true, meeting: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to close voting' }, { status: 500 });
  }
}
