import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function POST(req: Request, { params }: { params: { id: string } }) {
const id = params.id;
try {
await prisma.$transaction(async (tx) => {
const meeting = await tx.meeting.findUnique({ where: { id } });
if (!meeting) throw new Error('Meeting not found');
if (meeting.status === 'CLOSED') throw new Error('Meeting already closed');
if (meeting.status !== 'OPEN') throw new Error('Meeting is not open');


// total registered shares
const totalSharesAgg = await tx.shareholder.aggregate({ _sum: { shareValue: true } });
const totalShares = Number(totalSharesAgg._sum.shareValue ?? 0);


// sum of shares for shareholders who have an attendance row in this meeting
const attendedSharesAgg = await tx.shareholder.aggregate({
where: { attendances: { some: { meetingId: id } } },
_sum: { shareValue: true },
});
const attendedShares = Number(attendedSharesAgg._sum.shareValue ?? 0);


const quorumPct = meeting.quorumPct ?? 0; // stored as percentage e.g. 25 for 25%
const required = (totalShares * quorumPct) / 100;


if (attendedShares < required) {
throw new Error(`Quorum not met: attended ${attendedShares} < required ${required}`);
}


// All good: mark meeting CLOSED
await tx.meeting.update({ where: { id }, data: { status: 'CLOSED' } });
});


return NextResponse.json({ ok: true });
} catch (err: any) {
return NextResponse.json({ error: err.message ?? 'Failed to close meeting' }, { status: 400 });
}
}