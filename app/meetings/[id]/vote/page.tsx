'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function VotePage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [nominees, setNominees] = useState<any[]>([]);
  const [selectedNominees, setSelectedNominees] = useState<string[]>([]);
  const [voterId, setVoterId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/meetings/${id}/nominees`)
      .then(res => res.json())
      .then(data => {
        setMeeting({ status: data.meetingStatus });
        setNominees(data.items || data.nominees || []);
      })
      .catch(() => toast.error('Failed to load nominees'));
  }, [id]);

  const toggleNominee = (nomineeId: string) => {
    setSelectedNominees(prev =>
      prev.includes(nomineeId)
        ? prev.filter(id => id !== nomineeId)
        : [...prev, nomineeId]
    );
  };

  const handleSubmit = async () => {

    if (!voterId.trim()) {
      const msg = 'Please enter your Voter ID';
      toast.error(msg);
      autoClearMessages();
      return;
    }

    if (selectedNominees.length === 0) {
      const msg = 'Please select at least one nominee';
      toast.error(msg);
      autoClearMessages();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${id}/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId, nomineeIds: selectedNominees }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errMsg =
          data?.error ||
          (data?.issues?.[0]?.message ?? 'Failed to submit votes');
        toast.error(errMsg);
        autoClearMessages();
        return;
      }

      toast.success('Votes submitted successfully!');
      setSelectedNominees([]);
      autoClearMessages();
    } catch (err: any) {
      const errMsg = err.message ?? 'An unexpected error occurred';
      toast.error(errMsg);
      autoClearMessages();
    } finally {
      setLoading(false);
    }
  };

  // Auto clear messages after 4 seconds
  const autoClearMessages = () => {
    setTimeout(() => {
    }, 4000);
  };

  if (!meeting) return <div className="p-8 text-center">Loading meeting data...</div>;

  const isClosed = meeting.status === 'CLOSED';

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="shadow-md border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Meeting Voting</CardTitle>
        </CardHeader>
        <CardContent>

          {isClosed ? (
            <div className="text-center text-red-500 font-medium">
              Voting is closed for this meeting.
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enter Your Voter ID
                </label>
                <Input
                  placeholder="e.g. SH12345"
                  value={voterId}
                  onChange={e => setVoterId(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Select Nominees:</h3>
                <div className="space-y-2">
                  {nominees.length > 0 ? (
                    nominees.map(n => (
                      <div key={n.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={n.id}
                          checked={selectedNominees.includes(n.id)}
                          onCheckedChange={() => toggleNominee(n.id)}
                          disabled={loading}
                        />
                        <label htmlFor={n.id} className="text-sm cursor-pointer">
                          {n.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No nominees available for this meeting.
                    </p>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={loading || isClosed}
              >
                {loading ? 'Submitting...' : 'Submit Votes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
