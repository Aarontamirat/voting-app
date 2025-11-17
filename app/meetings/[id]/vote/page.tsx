"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VotePage() {
  const { id } = useParams();

  const [meeting, setMeeting] = useState<any>(null);
  const [nominees, setNominees] = useState<any[]>([]);
  const [selectedNominees, setSelectedNominees] = useState<string[]>([]);
  const [previousVotes, setPreviousVotes] = useState<string[]>([]);
  const [voterId, setVoterId] = useState("");
  const [voterEligible, setVoterEligible] = useState<boolean | null>(null);
  const [voteWeight, setVoteWeight] = useState<number | null>(null);
  const [maxVotes, setMaxVotes] = useState(0);

  const [loading, setLoading] = useState(false);

  const nomineesRef = useRef<HTMLDivElement>(null);
  let voterCheckTimer: number | undefined;

  useEffect(() => {
    if (!id) return;

    fetch(`/api/meetings/${id}/nominees`)
      .then((res) => res.json())
      .then((data) => {
        setMeeting({ status: data.meetingStatus });
        setNominees(data.items || []);
      })
      .catch(() => toast.error("Failed to load nominees"));
  }, [id]);

  // --- New checkVoter implementation (uses new GET ?voterId=)
  const checkVoter = async (voterID: string) => {
    if (!voterID.trim()) {
      setVoterEligible(null);
      setPreviousVotes([]);
      setVoteWeight(null);
      setSelectedNominees([]);
      return;
    }

    setVoterEligible(null); // checking...
    setPreviousVotes([]);
    setVoteWeight(null);

    try {
      // 1. Check attendance quickly
      const attRes = await fetch(`/api/meetings/${id}/attendance`);
      const attData = await attRes.json();
      if (!attRes.ok) {
        setVoterEligible(false);
        return;
      }

      const attended = attData.attendance.some(
        (a: any) =>
          a.shareholderId === voterID ||
          a.representedById === voterID ||
          a.representativeName === voterID
      );

      setVoterEligible(attended);
      if (!attended) {
        // do not toast — inline message only
        setPreviousVotes([]);
        setVoteWeight(null);
        setSelectedNominees([]);
        return;
      }

      // 2. Ask votes endpoint for previously voted nominee IDs by this voter
      const votesRes = await fetch(
        `/api/meetings/${id}/votes?voterId=${encodeURIComponent(voterID)}`
      );
      const votesData = await votesRes.json();
      if (votesRes.ok) {
        const voted = votesData.voted || [];
        setPreviousVotes(voted);
        // also pre-select previously voted nominees (but they will be disabled)
        setSelectedNominees(voted);
        // if voterWeight available from that endpoint use it, otherwise use attendance value
        if (typeof votesData.voterWeight === "number") {
          setVoteWeight(votesData.voterWeight);
        } else {
          const att = attData.attendance.find(
            (a: any) =>
              a.shareholderId === voterID || a.representedById === voterID
          );
          setVoteWeight(att ? Number(att.shareValue) : null);
        }

        // set Maxvotes
        setMaxVotes(votesData.maxVotes);
      } else {
        // if votes endpoint failed, still set weight from attendance
        const att = attData.attendance.find(
          (a: any) =>
            a.shareholderId === voterID || a.representedById === voterID
        );
        setVoteWeight(att ? Number(att.shareValue) : null);
      }

      // auto-scroll to nominees
      setTimeout(() => {
        nomineesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      console.error(err);
      setVoterEligible(false);
    }
  };

  // call checkVoter with debounce as user types
  const onVoterInput = (val: string) => {
    setVoterId(val);
    if (voterCheckTimer) window.clearTimeout(voterCheckTimer);
    voterCheckTimer = window.setTimeout(() => checkVoter(val), 350);
  };

  const toggleNominee = (nomineeId: string) => {
    // cannot add nominees already voted previously
    if (previousVotes.includes(nomineeId)) return;

    if (selectedNominees.includes(nomineeId)) {
      setSelectedNominees((prev) => prev.filter((x) => x !== nomineeId));
      return;
    }

    if (selectedNominees.length >= maxVotes) {
      toast.error(`Maximum ${maxVotes} nominees allowed.`);
      return;
    }

    setSelectedNominees((prev) => [...prev, nomineeId]);
  };

  const handleSubmit = async () => {
    if (!voterId.trim()) {
      toast.error("Enter Voter ID");
      return;
    }
    if (!voterEligible) {
      return;
    }

    // ensure we don't try to re-submit already-voted nominees (strip them)
    const payloadNominees = selectedNominees.filter(
      (id) => !previousVotes.includes(id)
    );
    if (payloadNominees.length === 0) {
      toast.error("No new nominees selected to submit.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voterId,
          nomineeIds: payloadNominees,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit votes");
        return;
      }

      // merge newly created votes into previousVotes so they become disabled
      setPreviousVotes((prev) => [...new Set([...prev, ...payloadNominees])]);
      // reflect that in selection (keep both sets selected for UX but disabled)
      setSelectedNominees((prev) => [
        ...new Set([...prev, ...payloadNominees]),
      ]);

      toast.success("Votes submitted!");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!meeting) return <div className="p-8 text-center">Loading meeting…</div>;
  const isClosed = meeting.status === "CLOSED";

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="shadow-md border bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Meeting Voting
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isClosed ? (
            <div className="text-center text-red-500 font-semibold">
              Voting is closed.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Voter ID
                </label>
                <Input
                  value={voterId}
                  onChange={(e) => onVoterInput(e.target.value)}
                  placeholder="e.g. SH12345"
                />

                {voterEligible === false && (
                  <p className="text-red-600 text-sm mt-1">
                    This voter did not attend.
                  </p>
                )}
                {voterEligible === true && (
                  <p className="text-green-600 text-sm mt-1">
                    Attended: Eligible to Vote.
                  </p>
                )}
                {voteWeight !== null && (
                  <p className="text-blue-600 text-sm mt-1">
                    Voting Weight: <strong>{voteWeight}</strong>
                  </p>
                )}
              </div>

              <div ref={nomineesRef}>
                <h3 className="text-sm font-medium mb-2">
                  Select up to {maxVotes} nominees
                </h3>

                <div className="space-y-2">
                  {nominees.map((n) => {
                    const already = previousVotes.includes(n.id);
                    return (
                      <div key={n.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={n.id}
                          checked={selectedNominees.includes(n.id)}
                          disabled={already || loading}
                          onCheckedChange={() => toggleNominee(n.id)}
                        />
                        <label
                          htmlFor={n.id}
                          className={`text-sm ${
                            already ? "text-gray-400" : ""
                          }`}
                        >
                          {n.name}{" "}
                          {already && (
                            <span className="ml-2 text-green-600">
                              (already voted)
                            </span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!voterEligible || loading}
              >
                {loading ? "Submitting..." : "Submit Vote"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
