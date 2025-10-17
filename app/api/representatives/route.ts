// app/api/representatives/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateRepSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
  shareholderId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const items = await prisma.representative.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ items });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateRepSchema.parse(body);
    const created = await prisma.representative.create({
      data: {
        name: parsed.name,
        phone: parsed.phone ?? null,
        shareholderId: parsed.shareholderId ?? null,
      },
    });
    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: err.message ?? 'Failed' }, { status: 400 });
  }
}
