import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the file directly from memory (no temp file)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the Excel buffer
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    // Example mapping (adjust column names to match your Excel headers)
    const shareholdersData = rows.map((row: any) => ({
      id: row["Id"],
      name: row["Name"],
      nameAm: row["Name Am"],
      phone: row["Phone"] ?? null,
      address: row["Address"] ?? null,
      shareValue: row["Share Value"],
    }));

    // validate rows have required fields
    for (const shareholder of shareholdersData) {
      // validate required fields
      if (!shareholder.id || !shareholder.name || !shareholder.shareValue) {
        return NextResponse.json(
          {
            error: "Invalid shareholder data, Please refer the template file.",
          },
          { status: 400 }
        );
      }
      //   validate share value is a number
      if (isNaN(shareholder.shareValue)) {
        return NextResponse.json(
          { error: "Share value must be a number" },
          { status: 400 }
        );
      }
    }

    // check if shareholder/s already exists
    const existingShareholders = await prisma.shareholder.findMany({
      select: { id: true, name: true },
      where: { id: { in: shareholdersData.map((s) => s.id) } },
    });
    if (existingShareholders.length > 0) {
      return NextResponse.json(
        {
          error: `Shareholder/s already exists: ${existingShareholders
            .map((s) => s.name)
            .join(", ")}`,
        },
        { status: 400 }
      );
    }

    // check if shareholders data is not empty
    if (shareholdersData.length === 0) {
      return NextResponse.json(
        { error: "No shareholder/s data found in the file." },
        { status: 400 }
      );
    }

    // Bulk insert into MySQL using Prisma
    const inserted = await prisma.shareholder.createMany({
      data: shareholdersData,
      skipDuplicates: true,
    });

    return NextResponse.json(
      { ok: true, count: shareholdersData.length },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
