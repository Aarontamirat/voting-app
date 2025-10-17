import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request, context: { params: { id: string } }) {
  const meetingId = context.params.id;

  try {
    // Get meeting details
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { id: true, title: true, date: true },
    });

    if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    // Get all attendees (shareholders who attended)
    const attendees = await prisma.attendance.findMany({
      where: { meetingId },
      include: {
        shareholder: { select: { id: true, name: true, shareValue: true } },
      },
    });

    // Get nominees for that meeting
    const nominees = await prisma.nominee.findMany({
      where: { meetingId },
      include: {
        shareholder: { select: { id: true, name: true, shareValue: true } },
      }
    });

    return NextResponse.json({
      meeting,
      attendees: attendees.map(a => ({
        id: a.shareholder.id,
        name: a.shareholder.name,
        shareValue: a.shareholder.shareValue,
      })),
      nominees: nominees.map(n => ({
        id: n.shareholder.id,
        name: n.shareholder.name,
        shareValue: n.shareholder.shareValue,
      })),
      totalShares: await fetchTotalShares(),

    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Failed to load voting cards' }, { status: 500 });
  }
}


async function fetchTotalShares() {
  const totalSharesAgg = await prisma.shareholder.aggregate({ _sum: { shareValue: true } });
  const totalShares = totalSharesAgg._sum.shareValue ?? 0;
  return totalShares;
}