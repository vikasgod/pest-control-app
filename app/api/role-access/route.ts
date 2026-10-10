import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { getRoleAccess, getRolePermissions, type CrmRole, roleAccessMatrix } from "../../../lib/role-access";

export const runtime = "nodejs";

function normalizeRole(role: string | null | undefined): CrmRole {
  if (role === "admin" || role === "manager" || role === "technician" || role === "customer") {
    return role;
  }

  return "customer";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedRole = searchParams.get("role");

  let role: CrmRole = "customer";

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    role = normalizeRole((session?.user as { role?: string } | undefined)?.role ?? requestedRole ?? "customer");
  } catch (error) {
    console.error("Failed to read session for role access API:", error);
  }

  if (requestedRole) {
    role = normalizeRole(requestedRole);
  }

  const access = getRoleAccess(role);
  const permissions = getRolePermissions(role);

  return NextResponse.json({
    role,
    roleLabel: role === "admin" ? "Admin" : role === "manager" ? "Manager" : role === "technician" ? "Technician" : "Customer",
    access,
    permissions,
    allRoles: Object.fromEntries(
      Object.entries(roleAccessMatrix).map(([key, value]) => [key, value]),
    ),
  });
}
