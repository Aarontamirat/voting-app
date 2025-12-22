"use client";
import LoaderRotatingLines from "@/components/general/LoaderRotatingLines";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export default function AttendanceReport() {
  const [loading, setLoading] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [data, setData] = useState<any>({
    meetingStatus: "",
    quorumPct: 0,
    totalShares: 0,
    attendedShares: 0,
    quorumMet: false,
    attendance: [],
    attendeesCount: 0,
    totalShareholdersCount: 0,
    required: 0,
  });

  const { id } = useParams();

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${id}/attendance`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch attendance");
      setData(data);
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const {
    meetingStatus,
    quorumPct,
    totalShares,
    attendedShares,
    quorumMet,
    attendance,
    attendeesCount,
    totalShareholdersCount,
    required,
  } = data;

  // inside your component
  const getImageDataUrl = async (url: string): Promise<string> => {
    // fetch the image and convert to dataURL
    const res = await fetch(url, { cache: "no-store" }); // use /logo.jpg path in public/
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const blob = await res.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image blob"));
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const generatePDF = async () => {
    try {
      setLoadingDownload(true);
      const doc = new jsPDF();

      // Path to the image
      const logoPath = "/logo.png";

      // convert to dataURL
      const logoDataUrl = await getImageDataUrl(logoPath);

      // compute sizing and add image (use JPEG or PNG depending on your file)
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidthMM = 70; // desired width in mm
      const imgHeightMM = 15; // desired height in mm
      const x = pageWidth / 2 - imgWidthMM / 2; // center horizontally
      const y = 5; // distance from top

      // format: "JPEG" for jpg files
      doc.addImage(logoDataUrl, "JPEG", x, y, imgWidthMM, imgHeightMM);

      // Draw title below the logo (y + height + spacing)
      const titleY = y + imgHeightMM + 5;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Meeting Attendance Report", pageWidth / 2, titleY, {
        align: "center",
      });

      // other meta text (adjust Y positions)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      let metaY = titleY + 12;
      doc.text(`Total Shares: ${totalShares}`, 14, metaY);
      doc.text(`Total Shareholders: ${totalShareholdersCount}`, x, metaY);
      metaY += 6;
      doc.text(`Attended Shares: ${attendedShares}`, 14, metaY);
      doc.text(`Attended Shareholders: ${attendeesCount}`, x, metaY);
      metaY += 6;
      doc.text(`Expected Shares: ${required}`, x, metaY);

      // build table from attendance and insert using autoTable
      const tableStartY = metaY + 8;
      const tableData = attendance.map((a: any) => [
        a.shareholderId,
        a.shareholderName,
        a.shareValue,
        a.representedByName ?? "Self",
        new Date(a.createdAt).toLocaleString(),
      ]);

      autoTable(doc, {
        head: [
          ["Id", "Shareholder", "Shares", "Represented By", "CheckIn Time"],
        ],
        body: tableData,
        startY: tableStartY,
        styles: { fontSize: 10 },
      });

      // save
      doc.save("Attendance_Report.pdf");
    } catch (err: any) {
      console.error("generatePDF error:", err);
      toast.error(err.message || "Failed generating PDF");
    } finally {
      setLoadingDownload(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <Card
        className="
      shadow-xl border
      bg-white/70 dark:bg-gray-800/50
      border-gray-300 dark:border-gray-700
      backdrop-blur-md
      transition-all
    "
      >
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="space-y-4">
            <div
              className="
            text-2xl font-extrabold
            bg-gradient-to-r from-cyan-500 to-blue-600
            dark:from-cyan-300 dark:to-blue-400
            text-transparent bg-clip-text
          "
            >
              Shareholders Management
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              <SummaryCard label="Status" value={meetingStatus} />
              <SummaryCard label="Quorum (%)" value={`${quorumPct}%`} />
              <SummaryCard label="Total Shares" value={totalShares} />
              <SummaryCard
                label="Total Shareholders"
                value={totalShareholdersCount}
              />
              <SummaryCard label="Attended Shares" value={attendedShares} />
              <SummaryCard
                label="Attended Shareholders"
                value={attendeesCount}
              />
              <SummaryCard label="Expected Shares" value={required} />
              <SummaryCard
                label="Quorum Met"
                value={quorumMet ? "Yes" : "No"}
                highlight={quorumMet}
              />
            </div>
          </CardTitle>

          {/* Generate PDF Button */}
          <Button
            onClick={generatePDF}
            variant="outline"
            size="lg"
            className="
          bg-transparent border-violet-500 text-violet-400
          hover:bg-violet-800 dark:hover:bg-violet-600 hover:text-white dark:hover:text-gray-900
          font-semibold shadow-md cursor-pointer transition-all duration-300
        "
            disabled={loading || loadingDownload}
          >
            {loadingDownload && <Loader2Icon className="animate-spin mr-2" />}
            Generate PDF
          </Button>
        </CardHeader>

        <CardContent>
          {/* Attendance Table */}
          <Table className="shadow-md border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <TableHeader className="bg-gray-100 dark:bg-gray-900">
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Shareholder</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Represented By</TableHead>
                <TableHead>CheckIn Time</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow className="bg-white/40 dark:bg-gray-800/40">
                  <TableCell colSpan={5} className="text-center p-4">
                    <LoaderRotatingLines
                      style={{
                        h: "30",
                        w: "30",
                        color: "#22d3ee",
                        strokeWidth: 4,
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}

              {!loading && attendance.length === 0 && (
                <TableRow className="bg-white/40 dark:bg-gray-800/40">
                  <TableCell
                    colSpan={5}
                    className="text-center p-4 text-red-500 dark:text-red-400 font-semibold"
                  >
                    No attendance data available
                  </TableCell>
                </TableRow>
              )}

              {attendance.map((a: any) => (
                <TableRow
                  key={a.id}
                  className="bg-white/50 dark:bg-gray-800/50 hover:bg-cyan-50 dark:hover:bg-gray-700/40 transition"
                >
                  <TableCell>{a.shareholderId}</TableCell>
                  <TableCell>{a.shareholderName}</TableCell>
                  <TableCell>{a.shareValue}</TableCell>
                  <TableCell>{a.representedByName ?? "Self"}</TableCell>
                  <TableCell>
                    {new Date(a.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

{
  /* Updated SummaryCard */
}
function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        p-4 rounded-lg shadow-md
        bg-white/30 dark:bg-gray-700/40
        backdrop-blur-sm
        border-l-4 hover:shadow-cyan-500/50
        ${
          highlight
            ? "border-green-500 text-green-500"
            : "border-cyan-500 text-cyan-400"
        }
        transition-all
      `}
    >
      <div className="text-sm md:text-base font-medium">{label}</div>
      <div className="text-lg md:text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
