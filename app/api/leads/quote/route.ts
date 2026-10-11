import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { connectToDatabase } from "../../../../lib/mongodb";
import { createQuoteToken, hashQuoteToken } from "../../../../lib/quote-token";
import LeadModel from "../../../../models/Lead";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user.role !== "technician") {
      return errorResponse("Technician authorization required.", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null) {
      return errorResponse("Quotation details are required.", 400);
    }
    const { leadId, amount, details } = body as Record<string, unknown>;
    if (
      typeof leadId !== "string" ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      !Number.isInteger(amount) ||
      amount <= 0 ||
      amount > 10_000_000 ||
      typeof details !== "string" ||
      !details.trim() ||
      details.trim().length > 2000
    ) {
      return errorResponse("Enter a valid quotation amount and treatment details.", 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.AUTH_EMAIL_FROM;
    if (!apiKey || !from) {
      return errorResponse("Quotation email is not configured on the server.", 503);
    }

    await connectToDatabase();
    const lead = await LeadModel.findOne({
      id: leadId,
      assignedTechnicianName: session.user.name,
      status: "Assigned",
    }).lean();
    if (!lead) return errorResponse("This lead is not assigned to you or is no longer awaiting a quote.", 404);

    const token = createQuoteToken();
    const quoteUrl = new URL(`/quote/${token}`, process.env.BETTER_AUTH_URL ?? new URL(request.url).origin).toString();
    const quotedAt = new Date();
    const quoteExpiresAt = new Date(quotedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const amountText = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
    const emailText = [
      `Hello ${lead.customerName},`,
      "",
      `Here is the quotation for your ${lead.service} request.`,
      `Quotation amount: ${amountText}`,
      "",
      "Treatment details:",
      details.trim(),
      "",
      "Review and accept or decline this quotation using your secure link:",
      quoteUrl,
      "",
      "This link expires in 7 days.",
    ].join("\n");
    const tokenHash = hashQuoteToken(token);
    const reservedLead = await LeadModel.findOneAndUpdate(
      { id: leadId, assignedTechnicianName: session.user.name, status: "Assigned" },
      {
        $set: {
          status: "Quoted",
          quoteAmount: amount,
          quoteDetails: details.trim(),
          quoteTokenHash: tokenHash,
          quoteExpiresAt,
          quotedAt,
        },
      },
      { new: true },
    ).lean();
    if (!reservedLead) return errorResponse("This lead changed before the quotation could be sent. Refresh and try again.", 409);

    async function releaseQuoteReservation() {
      const releasedLead = await LeadModel.findOneAndUpdate(
        { id: leadId, status: "Quoted", quoteTokenHash: tokenHash },
        {
          $set: { status: "Assigned" },
          $unset: {
            quoteAmount: "",
            quoteDetails: "",
            quoteTokenHash: "",
            quoteExpiresAt: "",
            quotedAt: "",
          },
        },
      );
      if (!releasedLead) {
        console.error("Unable to release lead after quotation email failure:", leadId);
      }
    }

    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [lead.email],
          subject: "Your Pestora service quotation",
          text: emailText,
        }),
      });
      if (!emailResponse.ok) {
        console.error("Quotation email delivery failed:", await emailResponse.text());
        await releaseQuoteReservation();
        return errorResponse("Unable to send the quotation email. Please try again.", 502);
      }
    } catch (emailError) {
      await releaseQuoteReservation();
      throw emailError;
    }

    return NextResponse.json({ lead: { id: reservedLead.id, status: reservedLead.status } });
  } catch (error) {
    console.error("Failed to send quotation:", error);
    return errorResponse("Unable to send this quotation.", 500);
  }
}
