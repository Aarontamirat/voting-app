import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


const CreateNomineeSchema = z.object({
name: z.string().min(1),
description: z.string().optional().nullable(),
});


export async function GET(req: Request, { params }: { params: { id: string } }) {
const id = params.id;
try {
const meeting = await prisma.meeting.findUnique({ where: { id } });
if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });


const nominees = await prisma.nominee.findMany({
where: { meetingId: id },
orderBy: { createdAt: 'asc' },
});


return NextResponse.json({ meetingStatus: meeting.status, nominees });
} catch (err: any) {
return NextResponse.json({ error: err.message ?? 'Failed to get nominees' }, { status: 500 });
}
}


export async function POST(req: Request, { params }: { params: { id: string } }) {
const id = params.id;
try {
const body = await req.json();
const parsed = CreateNomineeSchema.parse(body);


const meeting = await prisma.meeting.findUnique({ where: { id } });
if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
if (meeting.status === 'CLOSED') return NextResponse.json({ error: 'Cannot add nominee to closed meeting' }, { status: 400 });


const created = await prisma.nominee.create({
data: {
name: parsed.name,
description: parsed.description ?? null,
meetingId: id,
},
});


return NextResponse.json({ ok: true, nominee: created }, { status: 201 });
} catch (err: any) {
if (err?.issues) return NextResponse.json({ error: err.issues }, { status: 400 });
return NextResponse.json({ error: err.message ?? 'Failed to create nominee' }, { status: 400 });
}
}