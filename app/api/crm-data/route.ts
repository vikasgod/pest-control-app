import { NextResponse } from "next/server";
import { getCrmDummyData, type CrmDummyRole } from "../../../lib/crm-dummy-data";

function normalizeRole(role: string | null | undefined): CrmDummyRole {
  if (role === "admin" || role === "manager" || role === "technician" || role === "customer") {
    return role;
  }

  return "customer";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedRole = normalizeRole(searchParams.get("role"));

  const payload = getCrmDummyData(requestedRole);

  return NextResponse.json({
    role: requestedRole,
    generatedAt: new Date().toISOString(),
    data: payload,
  });
}
