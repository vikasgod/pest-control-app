
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import ServiceCategoryModel from "../../../../models/ServiceCategory";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json(
        { success: false, message: "Search query is required" },
        { status: 400 }
      );
    }

    const serviceCategories = await ServiceCategoryModel.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { "services.name": { $regex: q, $options: "i" } },
      ],
    }).limit(10);
    return NextResponse.json({
      success: true,
      count: serviceCategories.length,
      data: serviceCategories,
    });
  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
