import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { ensureTechnicianRoster } from "../../../lib/ensure-technician-roster";
import { connectToDatabase } from "../../../lib/mongodb";
import {
  serviceOptions,
  staffStatusOptions,
  type StaffMember,
  type StaffRole,
} from "../../../lib/technicians";
import TechnicianModel, { type StoredTechnician } from "../../../models/Technician";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

function toStaffMember(staff: StoredTechnician): StaffMember {
  return {
    id: staff.id,
    ...(staff.email ? { email: staff.email } : {}),
    name: staff.name,
    role: staff.role as StaffRole,
    team: staff.team,
    location: staff.location,
    ...(staff.pincode ? { pincode: staff.pincode } : {}),
    status: staff.status,
    ...(staff.manager ? { manager: staff.manager } : {}),
    services: staff.services,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    const role = session?.user.role;
    if (role !== "admin" && role !== "manager") {
      return errorResponse("Admin or manager authorization required.", 403);
    }
    if (role === "manager" && !session?.user.name.trim()) {
      return errorResponse("Manager profile name is required to load assigned technicians.", 403);
    }

    await connectToDatabase();
    await ensureTechnicianRoster();
    const staffFilter = role === "manager"
      ? { role: "Technician", manager: session?.user.name ?? "", isDeleted: { $ne: true } }
      : { isDeleted: { $ne: true } };
    const storedStaff = await TechnicianModel.find(staffFilter).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ staff: storedStaff.map((member) => toStaffMember(member)) });
  } catch (error) {
    console.error("Failed to load staff:", error);
    return errorResponse("Unable to load staff.", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const currentRole = session?.user.role;
    if (currentRole !== "admin" && currentRole !== "manager") {
      return errorResponse("Admin or manager authorization required.", 403);
    }
    const managerName = session?.user.name ?? "";
    if (currentRole === "manager" && !managerName.trim()) {
      return errorResponse("Manager profile name is required to add technicians.", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null) {
      return errorResponse("Staff details are required.", 400);
    }

    const payload = body as Record<string, unknown>;
    const { name, email, password, role: staffRole, team, location, pincode, manager, service, services, status } = payload;
    if (currentRole === "manager" && staffRole !== "Technician") {
      return errorResponse("Managers can only add technicians.", 403);
    }
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      (staffRole !== "Manager" && staffRole !== "Technician") ||
      typeof team !== "string" ||
      typeof location !== "string"
    ) {
      return errorResponse("Name, email, password, role, team, and location are required.", 400);
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedTeam = team.trim();
    const trimmedLocation = location.trim();
    if (
      !trimmedName ||
      trimmedName.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      normalizedEmail.length > 254 ||
      password.length < 8 ||
      password.length > 128 ||
      !trimmedTeam ||
      trimmedTeam.length > 100 ||
      !trimmedLocation ||
      trimmedLocation.length > 100
    ) {
      return errorResponse("Enter a valid email, a password of 8 to 128 characters, and name, team, and location of at most 100 characters.", 400);
    }
    const technicianServices =
      Array.isArray(services) ? services : typeof service === "string" ? [service] : [];
    const selectedStatus = status ?? (staffRole === "Manager" ? "Active" : "Available");
    if (!staffStatusOptions.some((option) => option === selectedStatus)) {
      return errorResponse("Select a valid staff status.", 400);
    }
    if (
      staffRole === "Technician" &&
      (typeof pincode !== "string" ||
        !/^\d{6}$/.test(pincode) ||
        technicianServices.length === 0 ||
        !technicianServices.every(
          (item): item is (typeof serviceOptions)[number] =>
            typeof item === "string" && serviceOptions.some((option) => option === item),
        ))
    ) {
      return errorResponse("Technicians require a valid 6-digit pincode and at least one service specialty.", 400);
    }

    await connectToDatabase();
    await ensureTechnicianRoster();
    const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingStaff = await TechnicianModel.findOne({
      name: { $regex: `^${escapedName}$`, $options: "i" },
      isDeleted: { $ne: true },
    });
    if (existingStaff) {
      return errorResponse("A staff member with this name already exists.", 409);
    }

    const authContext = await auth.$context;
    const existingAccount = await authContext.adapter.findOne({
      model: "user",
      where: [{ field: "email", value: normalizedEmail }],
    });
    if (existingAccount) {
      return errorResponse("An account with this email already exists.", 409);
    }

    const createdUser = await auth.api.signUpEmail({
      body: {
        name: trimmedName,
        email: normalizedEmail,
        password,
      },
    });

    try {
      const updatedUser = await authContext.internalAdapter.updateUser(createdUser.user.id, {
        role: staffRole === "Manager" ? "manager" : "technician",
      });
      if (!updatedUser) throw new Error("Unable to assign the staff account role.");

      const staff = await TechnicianModel.create({
        id: `st_${randomUUID()}`,
        userId: createdUser.user.id,
        email: normalizedEmail,
        name: trimmedName,
        role: staffRole,
        team: trimmedTeam,
        location: trimmedLocation,
        ...(staffRole === "Technician" ? { pincode, services: technicianServices } : {}),
        status: selectedStatus,
        ...(staffRole === "Technician" && currentRole === "manager"
          ? { manager: managerName }
          : staffRole === "Technician" && typeof manager === "string" && manager.trim()
            ? { manager: manager.trim() }
            : {}),
      });

      return NextResponse.json({ staff: toStaffMember(staff) }, { status: 201 });
    } catch (creationError) {
      try {
        await authContext.internalAdapter.deleteUser(createdUser.user.id);
      } catch (cleanupError) {
        console.error("Failed to clean up staff authentication account:", cleanupError);
      }
      throw creationError;
    }
  } catch (error) {
    console.error("Failed to add staff member:", error);
    return errorResponse("Unable to add staff member.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    const currentRole = session?.user.role;
    if (currentRole !== "admin" && currentRole !== "manager") {
      return errorResponse("Admin or manager authorization required.", 403);
    }
    const managerName = session?.user.name ?? "";
    if (currentRole === "manager" && !managerName.trim()) {
      return errorResponse("Manager profile name is required to edit assigned technicians.", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null) {
      return errorResponse("Staff details are required.", 400);
    }

    const payload = body as Record<string, unknown>;
    const { id, name, role, team, location, pincode, manager, services, status } = payload;
    if (
      typeof id !== "string" ||
      !id.trim() ||
      typeof name !== "string" ||
      (role !== "Manager" && role !== "Technician") ||
      typeof team !== "string" ||
      typeof location !== "string" ||
      typeof status !== "string" ||
      !staffStatusOptions.some((option) => option === status)
    ) {
      return errorResponse("Staff ID, name, role, team, location, and valid status are required.", 400);
    }
    if (currentRole === "manager" && role !== "Technician") {
      return errorResponse("Managers can only edit their assigned technicians.", 403);
    }

    const trimmedName = name.trim();
    const trimmedTeam = team.trim();
    const trimmedLocation = location.trim();
    if (!trimmedName || trimmedName.length > 100 || !trimmedTeam || trimmedTeam.length > 100 || !trimmedLocation || trimmedLocation.length > 100) {
      return errorResponse("Name, team, and location must be between 1 and 100 characters.", 400);
    }
    if (
      role === "Technician" &&
      (typeof pincode !== "string" ||
        !/^\d{6}$/.test(pincode) ||
        !Array.isArray(services) ||
        services.length === 0 ||
        !services.every(
          (item): item is (typeof serviceOptions)[number] =>
            typeof item === "string" && serviceOptions.some((option) => option === item),
        ))
    ) {
      return errorResponse("Technicians require a valid 6-digit pincode and at least one service specialty.", 400);
    }

    await connectToDatabase();
    await ensureTechnicianRoster();
    const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const duplicate = await TechnicianModel.findOne({
      id: { $ne: id },
      name: { $regex: `^${escapedName}$`, $options: "i" },
      isDeleted: { $ne: true },
    });
    if (duplicate) {
      return errorResponse("A staff member with this name already exists.", 409);
    }

    const staffFilter = currentRole === "manager"
      ? { id, role: "Technician", manager: managerName, isDeleted: { $ne: true } }
      : { id, isDeleted: { $ne: true } };
    const staff = await TechnicianModel.findOneAndUpdate(
      staffFilter,
      {
        $set: {
          name: trimmedName,
          role,
          team: trimmedTeam,
          location: trimmedLocation,
          status,
          ...(role === "Technician"
            ? {
                pincode,
                services,
                manager:
                  currentRole === "manager"
                    ? managerName
                    : typeof manager === "string" && manager.trim()
                      ? manager.trim()
                      : undefined,
              }
            : { pincode: undefined, services: [], manager: undefined }),
        },
      },
      { new: true, runValidators: true },
    );
    if (!staff) return errorResponse("Staff member not found.", 404);

    return NextResponse.json({ staff: toStaffMember(staff) });
  } catch (error) {
    console.error("Failed to update staff member:", error);
    return errorResponse("Unable to update staff member.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    const currentRole = session?.user.role;
    if (currentRole !== "admin" && currentRole !== "manager") {
      return errorResponse("Admin or manager authorization required.", 403);
    }
    const managerName = session?.user.name ?? "";
    if (currentRole === "manager" && !managerName.trim()) {
      return errorResponse("Manager profile name is required to remove assigned technicians.", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null) {
      return errorResponse("Staff ID is required.", 400);
    }
    const payload = body as Record<string, unknown>;
    if (typeof payload.id !== "string" || !payload.id.trim()) {
      return errorResponse("Staff ID is required.", 400);
    }

    await connectToDatabase();
    await ensureTechnicianRoster();
    const staffFilter = currentRole === "manager"
      ? { id: payload.id, role: "Technician", manager: managerName, isDeleted: { $ne: true } }
      : { id: payload.id, isDeleted: { $ne: true } };
    const deletedStaff = await TechnicianModel.findOneAndUpdate(
      staffFilter,
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!deletedStaff) return errorResponse("Staff member not found.", 404);

    return NextResponse.json({ deleted: true, id: deletedStaff.id });
  } catch (error) {
    console.error("Failed to delete staff member:", error);
    return errorResponse("Unable to delete staff member.", 500);
  }
}
