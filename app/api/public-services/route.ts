import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import ServiceCategoryModel, { type StoredServiceCategory } from "../../../models/ServiceCategory";

export const runtime = "nodejs";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await ServiceCategoryModel.find({ "services.isActive": true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      categories: categories
        .map((category) => ({
          id: category.id,
          name: category.name,
          services: category.services
            .filter((service: StoredServiceCategory["services"][number]) => service.isActive)
            .map((service: StoredServiceCategory["services"][number]) => ({
              id: service.id,
              name: service.name,
              serviceType: service.serviceType ?? "One time",
              propertyType: service.propertyType ?? "1 BHK",
              areaTypes: service.areaTypes ?? [],
              durationMinutes: service.durationMinutes,
              price: service.price,
              discountPrice: service.discountPrice,
            })),
        }))
        .filter((category) => category.services.length > 0),
    });
  } catch (error) {
    console.error("Failed to load customer service catalog:", error);
    return NextResponse.json({ error: "Unable to load available services." }, { status: 500 });
  }
}
