import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { hashQuoteToken } from "../../../../lib/quote-token";
import LeadModel from "../../../../models/Lead";

export const runtime = "nodejs";

type QuoteRouteContext = {
  params: Promise<{ token: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(_request: Request, { params }: QuoteRouteContext) {
  try {
    const { token } = await params;
    if (!/^[a-f0-9]{64}$/.test(token)) return errorResponse("Quotation link is invalid.", 404);
    await connectToDatabase();
    const lead = await LeadModel.findOne({
      quoteTokenHash: hashQuoteToken(token),
      status: "Quoted",
      quoteExpiresAt: { $gt: new Date() },
    })
      .select("customerName service quoteAmount quoteDetails quoteExpiresAt")
      .lean();
    if (!lead) return errorResponse("This quotation link has expired or is no longer available.", 404);
    return NextResponse.json({
      quote: {
        customerName: lead.customerName,
        service: lead.service,
        amount: lead.quoteAmount,
        details: lead.quoteDetails,
        expiresAt: lead.quoteExpiresAt,
      },
    });
  } catch (error) {
    console.error("Failed to load customer quotation:", error);
    return errorResponse("Unable to load this quotation.", 500);
  }
}

export async function POST(request: Request, { params }: QuoteRouteContext) {
  try {
    const { token } = await params;
    if (!/^[a-f0-9]{64}$/.test(token)) return errorResponse("Quotation link is invalid.", 404);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null) {
      return errorResponse("A quotation decision is required.", 400);
    }
    const { decision } = body as Record<string, unknown>;
    if (decision !== "Accepted" && decision !== "Declined") {
      return errorResponse("Select whether to accept or decline the quotation.", 400);
    }

    await connectToDatabase();
    const lead = await LeadModel.findOneAndUpdate(
      {
        quoteTokenHash: hashQuoteToken(token),
        status: "Quoted",
        quoteExpiresAt: { $gt: new Date() },
      },
      { $set: { status: decision, customerDecisionAt: new Date() } },
      { new: true },
    )
      .select("id status")
      .lean();
    if (!lead) return errorResponse("This quotation has expired or has already been answered.", 409);
    return NextResponse.json({ status: lead.status });
  } catch (error) {
    console.error("Failed to record quotation decision:", error);
    return errorResponse("Unable to record your quotation decision.", 500);
  }
}
