import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateMeetingSchema = z.object({
  title: z.string().min(1).optional(),
  date: z
    .string()
    .optional()
    .refine((s) => s === undefined || !Number.isNaN(Date.parse(s)), {
      message: "Invalid date",
    }),
  location: z.string().optional().nullable(),
  quorumPct: z.number().min(0).max(100).optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED", "VOTINGOPEN"]).optional(),
  firstPassers: z.coerce.number().optional(),
  secondPassers: z.coerce.number().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // aggregate totals for convenience
    const totalSharesAgg = await prisma.shareholder.aggregate({
      _sum: { shareValue: true },
    });
    const totalShares = totalSharesAgg._sum.shareValue ?? 0;

    // sum shares of attendees for this meeting
    const attendedSharesAgg = await prisma.shareholder.aggregate({
      where: { attendances: { some: { meetingId: id } } },
      _sum: { shareValue: true },
    });
    const attendedShares = attendedSharesAgg._sum.shareValue ?? 0;

    // nominees count
    const nomineesCount = await prisma.nominee.count({
      where: { meetingId: id },
    });

    return NextResponse.json({
      meeting,
      totalShares: totalShares.toString(),
      attendedShares: attendedShares.toString(),
      nomineesCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateMeetingSchema.parse(body);

    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (meeting.status === "CLOSED")
      return NextResponse.json(
        { error: "Cannot edit closed meeting" },
        { status: 400 }
      );
    if (meeting.status === "VOTINGOPEN")
      return NextResponse.json(
        { error: "Cannot edit voting open meeting" },
        { status: 400 }
      );
    if (parsed.quorumPct !== undefined && parsed.quorumPct > 100)
      return NextResponse.json(
        { error: "Quorum must be between 0 and 100" },
        { status: 400 }
      );
    if (parsed.quorumPct !== undefined && parsed.quorumPct < 0)
      return NextResponse.json(
        { error: "Quorum must be between 0 and 100" },
        { status: 400 }
      );

    const data: any = {};
    if (parsed.title !== undefined) data.title = parsed.title;
    if (parsed.date !== undefined) data.date = new Date(parsed.date);
    if (parsed.location !== undefined) data.location = parsed.location;
    if (parsed.quorumPct !== undefined) data.quorumPct = parsed.quorumPct;
    if (parsed.status !== undefined) data.status = parsed.status;
    if (parsed.firstPassers !== undefined)
      data.firstPassers = parsed.firstPassers;
    if (parsed.secondPassers !== undefined)
      data.secondPassers = parsed.secondPassers;

    const updated = await prisma.meeting.update({ where: { id }, data });
    return NextResponse.json({ ok: true, item: updated });
  } catch (err: any) {
    if (err?.issues)
      return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json(
      { error: err.message ?? "Failed to update" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (meeting.status === "CLOSED")
      return NextResponse.json(
        { error: "Cannot delete closed meeting" },
        { status: 400 }
      );
    if (meeting.status === "VOTINGOPEN")
      return NextResponse.json(
        { error: "Cannot delete voting open meeting" },
        { status: 400 }
      );
    if (meeting.status === "OPEN")
      return NextResponse.json(
        { error: "Cannot delete open meeting" },
        { status: 400 }
      );

    await prisma.meeting.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to delete" },
      { status: 400 }
    );
  }
}
