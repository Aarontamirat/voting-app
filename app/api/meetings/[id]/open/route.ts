import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const meeting = await prisma.meeting.findUnique({ where: { id } });
        if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
        if (meeting.status === 'OPEN') return NextResponse.json({ error: 'Meeting already open' }, { status: 400 });
        if (meeting.status === 'CLOSED') return NextResponse.json({ error: 'Meeting already closed' }, { status: 400 });


        // Set status to OPEN
        await prisma.meeting.update({ where: { id }, data: { status: 'OPEN' } });


        // Return shareholders for client-side attendance form
        const shareholders = await prisma.shareholder.findMany({ orderBy: { name: 'asc' } });
        const shareholdersSafe = shareholders.map((s) => ({ ...s, shareValue: s.shareValue.toString() }));


        return NextResponse.json({ ok: true, shareholders: shareholdersSafe });
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? 'Failed to open meeting' }, { status: 500 });
    }
}