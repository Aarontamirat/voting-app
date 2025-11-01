import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateNomineeSchema = z.object({
  shareholderId: z.string().min(1, 'shareholderId is required'),
  description: z.string().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    const nominees = await prisma.nominee.findMany({
      where: { meetingId: id },
      orderBy: { createdAt: 'asc' },
    });

    const shareholders = await prisma.shareholder.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      meetingStatus: meeting.status,
      items: nominees,
      shareholders
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Failed to get nominees' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = CreateNomineeSchema.parse(body);

    // 1. Validate meeting
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

    if (meeting.status === 'CLOSED')
      return NextResponse.json(
        { error: 'Cannot add nominee to closed meeting' },
        { status: 400 }
      );

    // 2. Validate shareholder
    const shareholder = await prisma.shareholder.findUnique({
      where: { id: parsed.shareholderId },
    });
    if (!shareholder)
      return NextResponse.json(
        { error: 'Shareholder not found' },
        { status: 404 }
      );

    // 3. Prevent duplicate nomination for the same shareholder in same meeting
    const existing = await prisma.nominee.findFirst({
      where: { meetingId: id, shareholderId: shareholder.id },
    });

    //const existingID = await prisma.nominee.findFirst({
    //  where: { meetingId: id, shareholderId: shareholder.id },
    //});

    if (existing)
      return NextResponse.json(
        { error: 'This shareholder is already nominated' },
        { status: 400 }
      );

    // 4. Create nominee
    const created = await prisma.nominee.create({
      data: {
        name: shareholder.name,
        description: parsed.description ?? null,
        meetingId: id,
        shareholderId: shareholder.id,
        nameAm: shareholder.nameAm ?? null,
      },
    });

    return NextResponse.json({ ok: true, nominee: created }, { status: 201 });
  } catch (err: any) {
    if (err?.issues)
      return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json(
      { error: err.message ?? 'Failed to create nominee' },
      { status: 400 }
    );
  }
}
