import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/mongodb";
import TechnicianModel from "../../../models/Technician";
import LeadModel from "../../../models/Lead";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON request body.", 400);
  }
  if (typeof body !== "object" || body === null) {
    return errorResponse("Quotation request details are required.", 400);
  }

  const payload = body as Record<string, unknown>;
  const { customerName, phone, email, location, service, propertyType, issueDetails } = payload;
  if (
    typeof customerName !== "string" ||
    typeof phone !== "string" ||
    typeof email !== "string" ||
    typeof location !== "string" ||
    typeof service !== "string" ||
    typeof propertyType !== "string" ||
    typeof issueDetails !== "string"
  ) {
    return errorResponse("Complete all required quotation request details.", 400);
  }

  const leadData = {
    customerName: customerName.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    location: location.trim(),
    service: service.trim(),
    propertyType: propertyType.trim(),
    issueDetails: issueDetails.trim(),
  };
  if (
    !leadData.customerName ||
    leadData.customerName.length > 100 ||
    !/^[+()\d\s-]{8,20}$/.test(leadData.phone) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email) ||
    leadData.email.length > 254 ||
    !leadData.location ||
    leadData.location.length > 300 ||
    !leadData.service ||
    leadData.service.length > 120 ||
    !leadData.propertyType ||
    leadData.propertyType.length > 100 ||
    !leadData.issueDetails ||
    leadData.issueDetails.length > 2000
  ) {
    return errorResponse("Please check the supplied details and try again.", 400);
  }

  try {
    await connectToDatabase();
    const lead = await LeadModel.create({
      id: `ld_${randomUUID()}`,
      ...leadData,
      source: "Website",
      status: "New",
    });
    return NextResponse.json({ lead: { id: lead.id, status: lead.status } }, { status: 201 });
  } catch (error) {
    console.error("Failed to create quotation lead:", error);
    return errorResponse("Unable to submit your quotation request.", 500);
  }
}

export async function GET() {
  try {
    const session = await getSession();
    const role = session?.user.role;
    if (role !== "admin" && role !== "manager" && role !== "technician") {
      return errorResponse("CRM authorization required.", 403);
    }
    await connectToDatabase();

    const query = role === "technician"
      ? { assignedTechnicianName: session?.user.name ?? "" }
      : {};
    const leads = await LeadModel.find(query).sort({ createdAt: -1 }).lean();
    const response: Record<string, unknown> = {
      leads: leads.map(({ _id, __v, quoteTokenHash, ...lead }) => lead),
    };
    if (role === "admin" || role === "manager") {
      const technicianQuery = role === "manager"
        ? { role: "Technician", manager: session?.user.name ?? "", isDeleted: { $ne: true } }
        : { role: "Technician", isDeleted: { $ne: true } };
      response.technicians = await TechnicianModel.find(technicianQuery)
        .select("id name")
        .sort({ name: 1 })
        .lean();
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to load CRM leads:", error);
    return errorResponse("Unable to load leads.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    const role = session?.user.role;
    if (role !== "admin" && role !== "manager") {
      return errorResponse("Admin or manager authorization required.", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null) {
      return errorResponse("Lead assignment details are required.", 400);
    }
    const { leadId, technicianId } = body as Record<string, unknown>;
    if (typeof leadId !== "string" || typeof technicianId !== "string") {
      return errorResponse("Lead and technician are required.", 400);
    }

    await connectToDatabase();
    const technicianFilter: Record<string, unknown> = {
      id: technicianId,
      role: "Technician",
      isDeleted: { $ne: true },
    };
    if (role === "manager") technicianFilter.manager = session?.user.name ?? "";
    const technician = await TechnicianModel.findOne(technicianFilter).lean();
    if (!technician) return errorResponse("That technician is not available for your team.", 404);

    const lead = await LeadModel.findOneAndUpdate(
      { id: leadId, status: { $in: ["New", "Assigned"] } },
      {
        $set: {
          status: "Assigned",
          managerName: session?.user.name ?? "",
          assignedTechnicianId: technician.id,
          assignedTechnicianName: technician.name,
        },
      },
      { new: true, runValidators: true },
    ).lean();
    if (!lead) return errorResponse("Lead not found or no longer assignable.", 409);
    const { _id, __v, quoteTokenHash, ...safeLead } = lead;
    return NextResponse.json({ lead: safeLead });
  } catch (error) {
    console.error("Failed to assign quotation lead:", error);
    return errorResponse("Unable to assign this lead.", 500);
  }
}
