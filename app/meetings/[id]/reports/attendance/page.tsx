import ReportUI from "./ReportUI";
import { headers } from "next/headers";

export default async function AttendanceReport({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // Detect the correct host
  const h = await headers();
  const host = h.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const res = await fetch(
    `${protocol}://${host}/api/meetings/${id}/attendance`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return (
      <div className="p-8 text-red-600">Failed to Load Attendance Report</div>
    );
  }

  const data = await res.json();
  return <ReportUI data={data} />;
}
