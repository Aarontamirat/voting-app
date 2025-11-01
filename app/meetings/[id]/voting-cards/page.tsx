'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import Logo from '@/public/logo.svg';

export default function VotingCardsPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [nominees, setNominees] = useState<any[]>([]);
  const [totalShares, setTotalShares] = useState('0');
  const [loading, setLoading] = useState(true);

  // Calculate the shareholders who has 2% or above shares from the Total Shares
  const top2Percent = attendees.filter((att) => Number(att.shareValue) >= (Number(totalShares) * 0.02));

  // Calculate the shareholders who has below 2% shares from the Total Shares
  const below2Percent = attendees.filter((att) => Number(att.shareValue) < (Number(totalShares) * 0.02));

  useEffect(() => {
    if (!id) return;
    fetch(`/api/meetings/${id}/voting-cards`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          toast.error(data.error);
          return;
        }
        setMeeting(data.meeting);
        setAttendees(data.attendees);
        setNominees(data.nominees);
        setTotalShares(data.totalShares);
      })
      .catch(() => toast.error('Failed to load voting cards'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-600">Loading voting cards...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen print:bg-white">
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold">
          Voting Cards for {meeting?.title || 'Meeting'}
        </h1>
        <Button className="no-print" onClick={() => window.print()}>
          🖨️ Print All
        </Button>
      </div>

      {attendees.length === 0 ? (
        <p className="text-gray-600">No attendees found for this meeting.</p>
      ) : (
        <div
          className="
            print-area 
            grid grid-rows-1 md:grid-rows-2 
            gap-6 
            print:grid-rows-2 
            print:gap-4
          "
        >
          {attendees.map((voter, index) => (
            <div
              key={voter.id}
              className="
                bg-white border border-gray-600 shadow-sm rounded-lg p-6 
                break-inside-avoid
                print:break-inside-avoid
              "
            >
              {/* Header */}
              <div className="flex justify-between mb-1 gap-4">
                <Image src={Logo} alt="Logo" className='w-40 h-auto' />
                <div className="">
                  <div className="flex items-center text-sm gap-4 whitespace-nowrap pr-2">
                    <p><strong>Voter ID:</strong> {voter.id}</p>
                    <p><strong>Voter Name:</strong> {voter.name}</p>
                    <p><strong>Share Value:</strong> {voter.shareValue}</p>
                  </div>
                  <div className="">
                    <p>
                      {
                        Number(voter.shareValue) >= (Number(totalShares) * 0.02) &&
                      <span className="text-sm font-bold text-green-500">
                        [Influencial Shareholder]
                      </span>
                      }
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-1 border-gray-300" />

              {/* Instructions */}
              <p className="text-sm mb-3 text-gray-700">
                <strong>Instructions:</strong> Please select your nominee from the list below by ticking the checkbox.
              </p>

              {/* Nominee list */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {nominees.length > 0 ? (
                  nominees.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-center justify-between border-b border-gray-400 py-1"
                    >
                      <span className="flex-1 text-sm">
                        {n.name}
                        {Number(n.shareValue) >= (Number(totalShares) * 0.02) &&
                        <span className="ml-2 text-sm font-bold text-green-500">(Influencial)</span>
                        }
                      </span>

                      <input type="checkbox" className="w-4 h-4 border-gray-600" readOnly />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No nominees available for this meeting.</p>
                )}
              </div>

              {/* Signature */}
              <div className="mt-8">
                <p className="text-sm text-gray-600">Signature of Voter:</p>
                <div className="border-b border-gray-400 w-64 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
