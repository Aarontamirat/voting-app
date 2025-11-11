// app/api/meetings/[id]/attendance/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BulkAddAttendanceSchema = z.object({
  // either "shareholderIds" (array) OR single "shareholderId" (legacy), but we prefer array
  shareholderIds: z.array(z.string()).min(1).optional(),
  shareholderId: z.string().optional(),
  // optional: existing representative id
  representativeId: z.string().optional(),
  // optional: if rep is a shareholder, supply that shareholder's id (we will create/find a Representative linking to that shareholder)
  representativeShareholderId: z.string().optional(),
  // optional: external rep name -> we'll create a Representative row
  representativeName: z.string().optional(),
});

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    const attendanceList = await prisma.attendance.findMany({
      where: { meetingId: id },
      include: {
        shareholder: true,
        representedBy: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalSharesAgg = await prisma.shareholder.aggregate({
      _sum: { shareValue: true },
    });
    const totalShares = Number(totalSharesAgg._sum.shareValue ?? 0);

    const attendedShares = attendanceList.reduce(
      (sum, a) => sum + Number(a.shareholder.shareValue),
      0
    );

    const quorumPct = meeting.quorumPct ?? 0;
    const required = (totalShares * quorumPct) / 100;
    const quorumMet = attendedShares >= required;

    const formatted = attendanceList.map((a) => ({
      id: a.id,
      shareholderId: a.shareholderId,
      shareholderName: a.shareholder.name,
      shareholderNameAm: a.shareholder.nameAm,
      shareValue: a.shareholder.shareValue.toString(),
      representedById: a.representedById,
      representedByName: a.representedBy?.name ?? a.representativeName ?? null,
      representativeName: a.representativeName,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      meetingStatus: meeting.status,
      quorumPct,
      totalShares,
      attendedShares,
      quorumMet,
      attendance: formatted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to get attendance" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const parsed = BulkAddAttendanceSchema.parse(body);

    // normalize to array of shareholderIds
    const shareholderIds: string[] =
      parsed.shareholderIds ??
      (parsed.shareholderId ? [parsed.shareholderId] : []);
    if (shareholderIds.length === 0) {
      return NextResponse.json(
        { error: "No shareholderIds provided" },
        { status: 400 }
      );
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: { attendances: true },
    });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    if (meeting.status === "CLOSED") {
      return NextResponse.json(
        { error: "Cannot modify attendance for closed meeting" },
        { status: 400 }
      );
    }

    // If the shareholder is already in the meeting, don't add again
    const existingShareholders = meeting.attendances.filter((a) =>
      shareholderIds.includes(a.shareholderId)
    );
    if (existingShareholders.length > 0) {
      return NextResponse.json(
        {
          error: `Shareholders ${existingShareholders
            .map((a) => a.shareholderId)
            .join(", ")} already in meeting, please uncheck them.`,
        },
        { status: 400 }
      );
    }

    // Auto-open if DRAFT and there's no attendance yet
    if (meeting.status === "DRAFT") {
      await prisma.meeting.update({ where: { id }, data: { status: "OPEN" } });
    }

    // Determine representative id to use (if any)
    let representativeId: string | null =
      parsed.representativeId?.trim() || null;

    // If representativeShareholderId provided, find or create a Representative that points to that shareholder
    if (!representativeId && parsed.representativeShareholderId) {
      const sh = await prisma.shareholder.findUnique({
        where: { id: parsed.representativeShareholderId },
      });
      if (!sh)
        return NextResponse.json(
          { error: "Representative shareholder not found" },
          { status: 404 }
        );

      // Try to find existing Representative that uses this shareholder
      const existingRep = await prisma.representative.findFirst({
        where: { shareholderId: parsed.representativeShareholderId },
      });
      if (existingRep) {
        representativeId = existingRep.id;
      } else {
        const createdRep = await prisma.representative.create({
          data: {
            name: sh.name,
            phone: sh.phone ?? null,
            shareholderId: parsed.representativeShareholderId,
          },
        });
        representativeId = createdRep.id;
      }
    }

    // If representativeName provided (external rep), create a Representative entry (so we can create Representation rows)
    if (representativeId && parsed.representativeName) {
      const existing = await prisma.representative.findUnique({
        where: { id: representativeId },
      });
      if (!existing) {
        await prisma.representative.create({
          data: {
            id: representativeId,
            name: parsed.representativeName,
            phone: null,
            shareholderId: null,
          },
        });
      }
    }

    // Now for each shareholderId, create Attendance and Representation rows if needed
    const createdAttendances: any[] = [];
    const skipped: string[] = [];
    for (const shId of shareholderIds) {
      // Skip if attendance already exists
      const existing = await prisma.attendance.findUnique({
        where: {
          meetingId_shareholderId: {
            meetingId: id,
            shareholderId: shId,
          },
        },
      });
      if (existing) {
        skipped.push(shId);
        continue;
      }

      // Create attendance
      const created = await prisma.attendance.create({
        data: {
          meetingId: id,
          shareholderId: shId,
          representedById: representativeId ?? null,
          representativeName: parsed.representativeName ?? null,
        },
        include: { shareholder: true, representedBy: true },
      });
      createdAttendances.push({
        id: created.id,
        shareholderId: created.shareholderId,
        shareholderName: created.shareholder.name,
        shareValue: created.shareholder.shareValue.toString(),
        representedById: created.representedById,
        representedByName:
          created.representedBy?.name ?? created.representativeName ?? null,
        createdAt: created.createdAt,
      });

      // Create Representation row linking rep->shareholder for THIS meeting (if we have a representativeId)
      if (representativeId) {
        try {
          await prisma.representation.create({
            data: {
              meetingId: id,
              representativeId,
              shareholderId: shId,
            },
          });
        } catch (e: any) {
          // ignore unique constraint errors (already represented)
          if (e?.code && e.code === "P2002") {
            // P2002 unique constraint failed: skip
          } else {
            // log / rethrow if other errors
            console.error("Error creating representation", e);
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      created: createdAttendances,
      skipped,
    });
  } catch (err: any) {
    if (err?.issues)
      return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json(
      { error: err.message ?? "Failed to add attendance" },
      { status: 400 }
    );
  }
}
