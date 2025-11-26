import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BulkAddAttendanceSchema = z.object({
  shareholderIds: z.array(z.string()).min(1).optional(),
  shareholderId: z.string().optional(),
  representativeId: z.string().optional(),
  representativeShareholderId: z.string().optional(),
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
        representedBy: true,
        shareholder: true, // still included, but no longer trusted for display
      },
      orderBy: { createdAt: "asc" },
    });

    const attendeesCount = attendanceList.length;

    // total shareholders for stats only
    const totalShareholdersCount = await prisma.shareholder.count();

    // total shares in system (live value used only for quorum requirement)
    const totalSharesAgg = await prisma.meeting.aggregate({
      where: { id: id },
      _sum: { snapshotTotalShares: true },
    });
    const totalShares = Number(totalSharesAgg._sum.snapshotTotalShares ?? 0);

    // attendedShares is now based on SNAPSHOT shareValue only
    const attendedShares = attendanceList.reduce(
      (sum, a) => sum + Number(a.snapshotShareValue),
      0
    );

    const quorumPct = meeting.quorumPct ?? 0;
    const required = (totalShares * quorumPct) / 100;
    const quorumMet = attendedShares >= required;

    // We now return snapshot data instead of live shareholder values
    const formatted = attendanceList.map((a) => ({
      id: a.id,
      shareholderId: a.shareholderId,

      shareholderName: a.snapshotName,
      shareholderNameAm: a.shareholder?.nameAm ?? null,
      shareValue: a.snapshotShareValue.toString(),

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
      attendeesCount,
      totalShareholdersCount,
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

    // Check duplicates
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

    // Auto-open meeting
    if (meeting.status === "DRAFT") {
      await prisma.meeting.update({ where: { id }, data: { status: "OPEN" } });
    }

    // HANDLE REPRESENTATIVE
    let representativeId: string | null =
      parsed.representativeId?.trim() || null;

    if (!representativeId && parsed.representativeShareholderId) {
      const sh = await prisma.shareholder.findUnique({
        where: { id: parsed.representativeShareholderId },
      });
      if (!sh)
        return NextResponse.json(
          { error: "Representative shareholder not found" },
          { status: 404 }
        );

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

    // External representative name
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

    // CREATE ATTENDANCE WITH SNAPSHOTS
    const createdAttendances: any[] = [];
    const skipped: string[] = [];

    for (const shId of shareholderIds) {
      const already = await prisma.attendance.findUnique({
        where: {
          meetingId_shareholderId: { meetingId: id, shareholderId: shId },
        },
      });
      if (already) {
        skipped.push(shId);
        continue;
      }

      // Fetch shareholder to snapshot
      const sh = await prisma.shareholder.findUnique({
        where: { id: shId },
      });
      if (!sh) continue;

      // SNAPSHOT creation
      const created = await prisma.attendance.create({
        data: {
          meetingId: id,
          shareholderId: shId,
          representedById: representativeId ?? null,
          representativeName: parsed.representativeName ?? null,

          // SNAPSHOT FIELDS
          snapshotName: sh.name,
          snapshotNameAm: sh.nameAm,
          snapshotPhone: sh.phone ?? null,
          snapshotAddress: sh.address ?? null,
          snapshotShareValue: sh.shareValue,
        },
        include: { representedBy: true },
      });

      createdAttendances.push({
        id: created.id,
        shareholderId: created.shareholderId,
        shareholderName: created.snapshotName,
        shareValue: created.snapshotShareValue.toString(),
        representedById: created.representedById,
        representedByName:
          created.representedBy?.name ?? created.representativeName ?? null,
        createdAt: created.createdAt,
      });

      // Representation linking
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
          if (e?.code !== "P2002") console.error(e);
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
