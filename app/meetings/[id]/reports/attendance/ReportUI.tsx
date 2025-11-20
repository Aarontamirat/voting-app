"use client";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportUI({ data }: { data: any }) {
  const {
    meetingStatus,
    quorumPct,
    totalShares,
    attendedShares,
    quorumMet,
    attendance,
  } = data;

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Meeting Attendance Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Status: ${meetingStatus}`, 14, 30);
    doc.text(`Quorum: ${quorumPct}%`, 14, 36);
    doc.text(`Total Shares: ${totalShares}`, 14, 42);
    doc.text(`Attended Shares: ${attendedShares}`, 14, 48);
    doc.text(`Quorum Met: ${quorumMet ? "Yes" : "No"}`, 14, 54);

    const tableData = attendance.map((a: any) => [
      a.shareholderId,
      a.shareholderName,
      a.shareValue,
      a.representedByName ?? "Self",
      new Date(a.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["Id", "Shareholder", "Shares", "Represented By", "CheckIn Time"]],
      body: tableData,
      startY: 60,
      styles: { fontSize: 10 },
    });

    doc.save("Attendance_Report.pdf");
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Meeting Attendance Report</h1>
        <Button onClick={generatePDF}>Download PDF</Button>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <SummaryCard label="Status" value={meetingStatus} />
        <SummaryCard label="Quorum (%)" value={`${quorumPct}%`} />
        <SummaryCard label="Total Shares" value={totalShares} />
        <SummaryCard label="Attended Shares" value={attendedShares} />
        <SummaryCard
          label="Quorum Met"
          value={quorumMet ? "Yes" : "No"}
          highlight={quorumMet}
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Id</th>
              <th className="p-3 text-left">Shareholder</th>
              <th className="p-3 text-left">Shares</th>
              <th className="p-3 text-left">Represented By</th>
              <th className="p-3 text-left">CheckIn Time</th>
            </tr>
          </thead>

          <tbody>
            {/* Render attendance data here */}
            {attendance.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-neutral-600 italic p-3 text-center"
                >
                  No attendance data available
                </td>
              </tr>
            )}
            {attendance.map((a: any) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">{a.shareholderId}</td>
                <td className="p-3">{a.shareholderName}</td>
                <td className="p-3">{a.shareValue}</td>
                <td className="p-3">{a.representedByName ?? "Self"}</td>
                <td className="p-3">
                  {new Date(a.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        highlight ? "bg-green-100 border-l-4 border-green-500" : "bg-white"
      }`}
    >
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
