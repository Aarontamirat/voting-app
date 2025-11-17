import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema for creating/editing meeting
const MeetingSchema = z.object({
  title: z.string().min(1),
  date: z.string(),
  location: z.string().min(1),
  quorum: z.number().min(1),
  status: z.string().optional(),
  firstPassers: z.coerce.number().optional(),
  secondPassers: z.coerce.number().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const take = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get("take") ?? "10"))
  );
  const skip = (page - 1) * take;

  const where: any = {};

  if (q) {
    where.title = { contains: q }; // simple case-sensitive search; can adapt for insensitive if needed
  }

  if (status) {
    where.status = status;
  }

  try {
    // Fetch total count and paginated meetings
    const total = await prisma.meeting.count({ where });
    const items = await prisma.meeting.findMany({
      where,
      skip,
      take,
      orderBy: { date: "desc" }, // latest meetings first
    });

    return NextResponse.json({ total, items, page, take });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = MeetingSchema.parse({
      ...body,
      quorum: Number(body.quorum),
      firstPassers: Number(body.firstPassers),
      secondPassers: Number(body.secondPassers),
    });

    const created = await prisma.meeting.create({
      data: {
        title: parsed.title,
        date: new Date(parsed.date),
        location: parsed.location,
        quorumPct: parsed.quorum,
        firstPassers: parsed.firstPassers,
        secondPassers: parsed.secondPassers,
      },
    });

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) {
      // Zod errors
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Failed to create meeting" },
      { status: 400 }
    );
  }
}
