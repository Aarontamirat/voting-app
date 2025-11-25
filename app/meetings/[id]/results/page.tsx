"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState<any[]>([]);
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${id}/votes`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch results");
      setResults(data.results || []);
      setMeeting({ status: data.meetingStatus });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, [id]);

  if (!meeting)
    return <div className="p-8 text-center">Loading results...</div>;

  const totalWeight = results.reduce((sum, r) => sum + (r.totalWeight || 0), 0);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card className="shadow-md border border-gray-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Voting Results
          </CardTitle>
          <Badge
            variant={meeting.status === "CLOSED" ? "secondary" : "outline"}
          >
            {meeting.status === "CLOSED" ? "Closed" : "In Progress"}
          </Badge>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-sm text-gray-500">Refreshing results...</p>
          )}

          {results.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              No votes recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((r, i) => {
                const percentage =
                  totalWeight > 0 ? (r.totalWeight / totalWeight) * 100 : 0;
                return (
                  <div
                    key={r.nomineeId}
                    className="p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium">
                        {i + 1}. {r.name}
                      </div>
                      <div className="text-sm text-gray-600 font-semibold">
                        {r.totalWeight.toLocaleString()} shares
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {percentage.toFixed(2)}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchResults}
              disabled={loading}
            >
              Refresh Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
