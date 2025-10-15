import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';


const UpdateShareholderSchema = z.object({
name: z.string().min(1).optional(),
phone: z.string().optional().nullable(),
address: z.string().optional().nullable(),
shareValue: z.union([z.string(), z.number()]).optional(),
});


export async function GET(req: Request, { params }: { params: { id: string } }) {
const id = params.id;
try {
const item = await prisma.shareholder.findUnique({ where: { id } });
if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
return NextResponse.json({ item: { ...item, shareValue: item.shareValue.toString() } });
} catch (err: any) {
return NextResponse.json({ error: err.message ?? 'Error' }, { status: 500 });
}
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
const id = params.id;
try {
const body = await req.json();
const parsed = UpdateShareholderSchema.parse(body);


// Prevent empty update
if (Object.keys(parsed).length === 0) {
return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
}


const data: any = {};
if (parsed.name !== undefined) data.name = parsed.name;
if (parsed.phone !== undefined) data.phone = parsed.phone;
if (parsed.address !== undefined) data.address = parsed.address;
if (parsed.shareValue !== undefined) data.shareValue = parsed.shareValue.toString();


const updated = await prisma.shareholder.update({ where: { id }, data });


return NextResponse.json({ ok: true, item: { ...updated, shareValue: updated.shareValue.toString() } });
} catch (err: any) {
if (err?.issues) return NextResponse.json({ error: err.issues }, { status: 400 });
if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
return NextResponse.json({ error: err.message ?? 'Failed to update' }, { status: 400 });
}
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
const id = params.id;
try {
// consider cascade rules: if shareholder has attendances or votes, you may want to soft-delete instead
await prisma.shareholder.delete({ where: { id } });
return NextResponse.json({ ok: true });
} catch (err: any) {
if (err?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
return NextResponse.json({ error: err.message ?? 'Failed to delete' }, { status: 400 });
}
}