import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateNomineeSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1),
  description: z.string().optional().nullable(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; nomineeId: string }> }
) {
  const { id, nomineeId } = await params;
  try {
    const body = await req.json();
    const parsed = UpdateNomineeSchema.parse(body);

    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    if (meeting.status === "CLOSED")
      return NextResponse.json(
        { error: "Cannot edit nominee in closed meeting" },
        { status: 400 }
      );
    if (meeting.status === "VOTINGOPEN")
      return NextResponse.json(
        { error: "Cannot edit nominee in voting opened meeting" },
        { status: 400 }
      );

    const updated = await prisma.nominee.update({
      where: { id: nomineeId },
      data: {
        ...(parsed.name !== undefined && { name: parsed.name }),
        ...(parsed.type !== undefined && { type: parsed.type }),
        ...(parsed.description !== undefined && {
          description: parsed.description,
        }),
      },
    });

    return NextResponse.json({ ok: true, nominee: updated });
  } catch (err: any) {
    if (err?.issues)
      return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json(
      { error: err.message ?? "Failed to update nominee" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; nomineeId: string }> }
) {
  const { id, nomineeId } = await params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    if (meeting.status === "CLOSED")
      return NextResponse.json(
        { error: "Cannot delete nominee from closed meeting" },
        { status: 400 }
      );

    const deleted = await prisma.nominee.delete({ where: { id: nomineeId } });
    return NextResponse.json({ ok: true, deleted });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to delete nominee" },
      { status: 400 }
    );
  }
}
