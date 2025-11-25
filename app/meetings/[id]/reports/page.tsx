"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Reports() {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-6 ">
      <Card className="bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100">
        <CardHeader>
          <CardTitle className="text-xl text-blue-300 font-semibold">
            Meeting Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Attendance Report Generator */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={`/meetings/${id}/reports/attendance`}
              className="w-full sm:w-auto"
            >
              <Button className="bg-blue-500 hover:bg-blue-700 text-white">
                Attendance Report
              </Button>
            </Link>
            <Link
              href={`/meetings/${id}/reports/nominees`}
              className="w-full sm:w-auto"
            >
              <Button className="bg-green-500 hover:bg-green-700 text-white">
                Nominees Report
              </Button>
            </Link>
            <Link
              href={`/meetings/${id}/reports/votes`}
              className="w-full sm:w-auto"
            >
              <Button className="bg-red-500 hover:bg-red-700 text-white">
                Votes Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
