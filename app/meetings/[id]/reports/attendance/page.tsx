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
      const logoPath = "/some.png";

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
    <div className="max-w-5xl sm:max-w-6xl md:max-w-7xl 2xl:max-w-8xl mx-auto p-8">
      <Card className="shadow-md border-none bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="space-y-4">
            <div className="text-2xl text-blue-400 font-semibold">
              Shareholders Management
            </div>
            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 ">
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
            variant={"outline"}
            size={"lg"}
            className="bg-transparent border-violet-500 text-violet-400 hover:bg-violet-800 hover:text-neutral-100 duration-300 transition"
            disabled={loading || loadingDownload}
          >
            {loadingDownload && <Loader2Icon className="animate-spin" />}
            Generate PDF
          </Button>
        </CardHeader>

        <CardContent>
          {/* Attendance Table */}
          <Table className="border-spacing-x-2 border-spacing-y-1 shadow-lg">
            <TableHeader className="bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100 hover:bg-gray-900">
              <TableRow className="bg-gray-800 hover:bg-gray-900">
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-200">
                  Id
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-200">
                  Shareholder
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-200">
                  Shares
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-200">
                  Represented By
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider border-b border-gray-200">
                  CheckIn Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100">
              {loading && (
                <TableRow className="hover:bg-gray-800">
                  <TableCell
                    colSpan={5}
                    className="text-center bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100 p-4 font-bold animate-pulse"
                  >
                    <LoaderRotatingLines
                      style={{
                        h: "30",
                        w: "30",
                        color: "#9cc5f5",
                        strokeWidth: 4,
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
              {attendance.length === 0 && loading === false && (
                <TableRow className="hover:bg-gray-800">
                  <TableCell
                    colSpan={5}
                    className="text-center bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100 p-4 font-bold "
                  >
                    No attendance data available
                  </TableCell>
                </TableRow>
              )}
              {attendance.map((a: any) => (
                <TableRow
                  key={a.id}
                  className="hover:bg-gray-800 transition duration-150 ease-in-out"
                >
                  <TableCell className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    {a.shareholderId}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    {a.shareholderName}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    {a.shareValue}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    {a.representedByName ?? "Self"}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
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
      className={`p-4 rounded-lg shadow ${
        highlight
          ? "bg-gray-900 text-green-500 border-l-4 border-green-500"
          : "bg-gray-900 text-blue-500"
      }`}
    >
      <div className="text-blue-500 text-sm md:text-base lg:text-lg">
        {label}
      </div>
      <div className="text-orange-500 text-sm md:text-base lg:text-lg font-semibold">
        {value}
      </div>
    </div>
  );
}
