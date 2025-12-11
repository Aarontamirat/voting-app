"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function Reports() {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-6 px-4">
      <Card
        className="
      shadow-xl border
      bg-white/70 dark:bg-gray-800/50
      border-gray-300 dark:border-gray-700
      backdrop-blur-md
      transition-all
    "
      >
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <CardTitle
            className="
          text-xl font-extrabold
          bg-gradient-to-r from-cyan-500 to-blue-600
          dark:from-cyan-300 dark:to-blue-400
          text-transparent bg-clip-text
        "
          >
            Meeting Report
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* Attendance / Nominees / Votes Report Buttons */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <Link
              href={`/meetings/${id}/reports/attendance`}
              className="w-full sm:w-auto"
            >
              <Button
                className="
              bg-cyan-600 hover:bg-cyan-700 
              text-white font-semibold shadow-md
            "
              >
                Attendance Report
              </Button>
            </Link>

            <Link
              href={`/meetings/${id}/reports/nominees`}
              className="w-full sm:w-auto"
            >
              <Button
                className="
              bg-green-600 hover:bg-green-700 
              text-white font-semibold shadow-md
            "
              >
                Nominees Report
              </Button>
            </Link>

            <Link
              href={`/meetings/${id}/reports/votes`}
              className="w-full sm:w-auto"
            >
              <Button
                className="
              bg-red-600 hover:bg-red-700 
              text-white font-semibold shadow-md
            "
              >
                Votes Report
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
