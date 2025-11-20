"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Reports() {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meeting Report</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Attendance Report Generator */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/meetings/${id}/reports/attendance`}
              className="w-full sm:w-auto"
            >
              <Button>Attendance Report</Button>
            </Link>
            <Link
              href={`/meetings/${id}/reports/nominees`}
              className="w-full sm:w-auto"
            >
              <Button>Nominees Report</Button>
            </Link>
            <Link
              href={`/meetings/${id}/reports/votes`}
              className="w-full sm:w-auto"
            >
              <Button>Votes Report</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
