import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SubmitVotesSchema = z.object({
  voterId: z.string().min(1),
  nomineeIds: z.array(z.string().min(1)).min(1),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const meetingId = id;

  try {
    const body = await req.json();
    const parsed = SubmitVotesSchema.parse(body);

    // Check if meeting exists and is open for voting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    if (meeting.status !== "OPEN" && meeting.status !== "VOTINGOPEN") {
      return NextResponse.json(
        { error: "Meeting not open for voting" },
        { status: 400 }
      );
    }

    // Determine if voter is representative or shareholder
    const possibleRep = await prisma.representative.findUnique({
      where: { id: parsed.voterId },
    });

    let weight = 0;
    let isEligible = false;

    if (possibleRep) {
      // --- If voter is a representative ---
      // Representative can only vote if they represent at least one attendee (or their own shareholder attended)

      // Check if this representative is linked to the meeting attendance table
      const representedAttendees = await prisma.attendance.findMany({
        where: {
          meetingId,
          OR: [
            { representedById: possibleRep.id },
            { representativeName: possibleRep.name },
          ],
        },
      });

      // If representative’s linked shareholder attended, that’s also valid
      let repOwnAttendance = null;
      if (possibleRep.shareholderId) {
        repOwnAttendance = await prisma.attendance.findFirst({
          where: { meetingId, shareholderId: possibleRep.shareholderId },
        });
      }

      if (representedAttendees.length > 0 || repOwnAttendance) {
        isEligible = true;
      }

      // Calculate weight
      if (possibleRep.shareholderId) {
        const repShare = await prisma.shareholder.findUnique({
          where: { id: possibleRep.shareholderId },
        });
        weight += Number(repShare?.shareValue ?? 0);
      }

      const reps = await prisma.representation.findMany({
        where: { meetingId, representativeId: possibleRep.id },
        select: { shareholderId: true },
      });
      if (reps.length > 0) {
        const ids = reps.map((r) => r.shareholderId);
        const sumAgg = await prisma.shareholder.aggregate({
          where: { id: { in: ids } },
          _sum: { shareValue: true },
        });
        weight += Number(sumAgg._sum.shareValue ?? 0);
      }
    } else {
      // --- If voter is a shareholder ---
      const sh = await prisma.shareholder.findUnique({
        where: { id: parsed.voterId },
      });
      if (!sh)
        return NextResponse.json({ error: "Voter not found" }, { status: 404 });
      weight = Number(sh.shareValue);

      // Ensure shareholder attended the meeting
      const attended = await prisma.attendance.findFirst({
        where: { meetingId, shareholderId: parsed.voterId },
      });

      if (attended) isEligible = true;
    }

    // Reject if not eligible
    if (!isEligible) {
      return NextResponse.json(
        { error: "Voter did not attend this meeting and cannot vote" },
        { status: 403 }
      );
    }

    // Reject zero-weight votes
    if (weight <= 0) {
      return NextResponse.json(
        { error: "Vote weight is zero; cannot submit vote." },
        { status: 400 }
      );
    }

    // Transaction: Prevent duplicate votes, create only new ones
    const nomineeIds = parsed.nomineeIds;
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.vote.findMany({
        where: {
          meetingId,
          nomineeId: { in: nomineeIds },
          voterId: parsed.voterId,
        },
        select: { nomineeId: true },
      });

      const alreadyVotedSet = new Set(existing.map((e) => e.nomineeId));
      const toCreate = nomineeIds.filter((id) => !alreadyVotedSet.has(id));

      if (toCreate.length === 0) {
        return { created: [], already: nomineeIds };
      }

      const created = [];
      for (const nomineeId of toCreate) {
        const c = await tx.vote.create({
          data: {
            meetingId,
            nomineeId,
            voterId: parsed.voterId,
            weight,
          },
        });
        created.push(c);
      }

      return { created, already: existing.map((e) => e.nomineeId) };
    });

    return NextResponse.json({
      ok: true,
      created: result.created,
      already: result.already,
    });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: err.message ?? "Failed to submit votes" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const meetingId = id;
  try {
    // parse optional voterId query param
    const url = new URL(req.url);
    const voterId = url.searchParams.get("voterId");

    // If caller requests votes for a particular voter, return those nomineeIds
    if (voterId) {
      // ensure meeting exists
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
      });
      if (!meeting)
        return NextResponse.json(
          { error: "Meeting not found" },
          { status: 404 }
        );

      // fetch votes by this voter for the meeting
      const votes = await prisma.vote.findMany({
        where: { meetingId, voterId },
        select: { nomineeId: true, weight: true },
      });

      const votedNomineeIds = votes.map((v) => v.nomineeId);
      const totalWeight = votes.reduce((s, v) => s + Number(v.weight), 0);

      return NextResponse.json({
        meetingStatus: meeting.status,
        voterId,
        voted: votedNomineeIds,
        voterWeight: totalWeight,
      });
    }

    // Default behavior: aggregated results + total attended shares (unchanged)
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });
    if (!meeting)
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    const nominees = await prisma.nominee.findMany({ where: { meetingId } });

    const grouped = await prisma.vote.groupBy({
      by: ["nomineeId"],
      where: { meetingId },
      _sum: { weight: true },
    });

    // Get the total share value of the attended shareholders
    const attendanceList = await prisma.attendance.findMany({
      where: { meetingId },
      include: { shareholder: true },
    });

    const attendedShares = attendanceList.reduce(
      (sum, a) => sum + Number(a.shareholder.shareValue),
      0
    );

    const results = nominees.map((n) => {
      const g = grouped.find((x) => x.nomineeId === n.id);
      return {
        nomineeId: n.id,
        name: n.name,
        nameAm: (n as any).nameAm,
        type: n.type,
        description: n.description,
        totalWeight: Number(g?._sum.weight ?? 0),
      };
    });

    results.sort((a, b) => b.totalWeight - a.totalWeight);

    return NextResponse.json({
      meetingStatus: meeting.status,
      results,
      totalSharesAttended: attendedShares,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch results" },
      { status: 500 }
    );
  }
}
