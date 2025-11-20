import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
