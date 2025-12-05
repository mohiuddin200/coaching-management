import { NextRequest, NextResponse } from "next/server";
import { getSoftDeletedStudentPayments } from "@/lib/payment-soft-delete";

// GET - Get archived (soft deleted) student payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await getSoftDeletedStudentPayments(page, limit);

    return NextResponse.json({
      data: result.payments,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching archived student payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch archived student payments" },
      { status: 500 }
    );
  }
}