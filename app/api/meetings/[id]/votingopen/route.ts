import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    // Check if meeting is in DRAFT status
    if (meeting.status === "DRAFT")
      return NextResponse.json(
        {
          error:
            "Meeting is not open yet. Meeting must be open before opening voting.",
        },
        { status: 400 }
      );

    // Check if meeting is already voting open
    if (meeting.status === "VOTINGOPEN")
      return NextResponse.json(
        { error: "Voting is already opened" },
        { status: 400 }
      );

    //   Check if firstPasser and secondPasser are present
    if (
      !meeting.firstPassers ||
      meeting.firstPassers === 0 ||
      !meeting.secondPassers ||
      meeting.secondPassers === 0
    )
      return NextResponse.json(
        { error: "First and second passers are not set for this meeting." },
        { status: 400 }
      );

    // Check if meeting is already closed
    if (meeting.status === "CLOSED")
      return NextResponse.json(
        { error: "Meeting is already closed" },
        { status: 400 }
      );

    const totalSharesAgg = await prisma.shareholder.aggregate({
      _sum: { shareValue: true },
    });

    // Set status to OPEN
    await prisma.meeting.update({
      where: { id },
      data: {
        status: "VOTINGOPEN",
        snapshotTotalShares: totalSharesAgg._sum.shareValue ?? 0,
        snapshotTotalHolders: await prisma.shareholder.count(),
      },
    });

    // Return shareholders for client-side attendance form
    const shareholders = await prisma.shareholder.findMany({
      orderBy: { name: "asc" },
    });
    const shareholdersSafe = shareholders.map((s) => ({
      ...s,
      shareValue: s.shareValue.toString(),
    }));

    return NextResponse.json({ ok: true, shareholders: shareholdersSafe });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to open meeting" },
      { status: 500 }
    );
  }
}
