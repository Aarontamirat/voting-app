"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";
import Logo from "@/public/logo.svg";

export default function VotingCardsPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [nominees, setNominees] = useState<any[]>([]);
  const [totalShares, setTotalShares] = useState("0");
  const [loading, setLoading] = useState(true);

  // Calculate the shareholders who has 2% or above shares from the Total Shares
  const top2Percent = attendees.filter(
    (att) => Number(att.shareValue) >= Number(totalShares) * 0.02
  );

  // Calculate the shareholders who has below 2% shares from the Total Shares
  const below2Percent = attendees.filter(
    (att) => Number(att.shareValue) < Number(totalShares) * 0.02
  );

  useEffect(() => {
    if (!id) return;
    fetch(`/api/meetings/${id}/voting-cards`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setMeeting(data.meeting);
        setAttendees(data.attendees);
        setNominees(data.nominees);
        setTotalShares(data.totalShares);
      })
      .catch(() => toast.error("Failed to load voting cards"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">
        Loading voting cards...
      </div>
    );

  return (
    <div
      className="
    p-6 min-h-screen
    bg-gradient-to-br from-gray-100 to-gray-200 
    dark:from-gray-900 dark:to-gray-800
    text-gray-900 dark:text-gray-100
    print:bg-white
  "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 no-print">
        <h1
          className="
        text-3xl font-extrabold tracking-tight
        bg-gradient-to-r from-cyan-500 to-blue-600
        dark:from-cyan-300 dark:to-blue-400
        text-transparent bg-clip-text
      "
        >
          Voting Cards for {meeting?.title || "Meeting"}
        </h1>

        <Button
          className="
        no-print font-semibold px-4 py-2
        bg-gradient-to-r from-violet-600 to-purple-700 text-white
        hover:from-violet-700 hover:to-purple-800
        shadow-lg transition
      "
          onClick={() => window.print()}
        >
          Print All
        </Button>
      </div>

      {attendees.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          No attendees found for this meeting.
        </p>
      ) : (
        <div
          className="
        print-area 
        grid grid-rows-1 md:grid-rows-2 
        gap-6 print:gap-4
      "
        >
          {attendees.map((voter) => (
            <div
              key={voter.id}
              className="
            bg-white/70 dark:bg-gray-800/50
            border border-gray-300 dark:border-gray-700
            shadow-lg rounded-xl p-6 
            backdrop-blur-md
            break-inside-avoid print:break-inside-avoid
            transition-all
          "
            >
              {/* Header */}
              <div className="flex justify-between mb-3 gap-4">
                <Image
                  src={Logo}
                  alt="Logo"
                  className="w-36 h-auto opacity-90 dark:opacity-100"
                />

                <div className="space-y-1 text-sm">
                  <p>
                    <strong className="text-cyan-600 dark:text-cyan-300">
                      Voter ID:
                    </strong>{" "}
                    {voter.id}
                  </p>
                  <p>
                    <strong className="text-blue-600 dark:text-blue-300">
                      Voter Name:
                    </strong>{" "}
                    {voter.name}
                  </p>
                  <p>
                    <strong className="text-purple-600 dark:text-purple-300">
                      Share Value:
                    </strong>{" "}
                    {voter.shareValue}
                  </p>

                  {Number(voter.shareValue) >= Number(totalShares) * 0.02 && (
                    <p className="text-green-500 font-bold">
                      [Influential Shareholder]
                    </p>
                  )}
                </div>
              </div>

              <hr className="my-2 border-gray-300 dark:border-gray-700" />

              {/* Instructions */}
              <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
                <strong>Instructions:</strong> Select your nominee by ticking
                the checkbox.
              </p>

              {/* Nominee list */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {nominees.length > 0 ? (
                  nominees.map((n) => (
                    <div
                      key={n.id}
                      className="
                    flex items-center justify-between py-1
                    border-b border-gray-300 dark:border-gray-600
                    text-sm
                  "
                    >
                      <span className="flex-1">
                        {n.name}
                        {Number(n.shareValue) >= Number(totalShares) * 0.02 && (
                          <span className="ml-2 text-green-500 font-bold">
                            (Influential)
                          </span>
                        )}
                      </span>

                      <input
                        type="checkbox"
                        readOnly
                        className="
                      w-4 h-4
                      border-gray-600 dark:border-gray-300
                      rounded-sm
                    "
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No nominees available for this meeting.
                  </p>
                )}
              </div>

              {/* Signature */}
              <div className="mt-8">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Signature of Voter:
                </p>
                <div
                  className="
                border-b border-gray-400 dark:border-gray-600 
                w-64 mt-3
              "
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
