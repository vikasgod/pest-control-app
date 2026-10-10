import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { connectToDatabase } from "../../../../../../lib/mongodb";
import {
  isPropertyType,
  isValidServiceAreas,
  isServiceType,
  normalizeStoredPropertyType,
} from "../../../../../../lib/service-types";
import ServiceCategoryModel, { type StoredServiceCategory } from "../../../../../../models/ServiceCategory";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.role === "admin";
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    if (!(await isAdmin())) {
      return errorResponse("Admin authorization required.", 403);
    }

    const { categoryId } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }

    if (typeof body !== "object" || body === null) {
      return errorResponse("Service details are required.", 400);
    }

    const payload = body as Record<string, unknown>;
    const {
      name,
      serviceType,
      propertyType,
      areaTypes,
      durationMinutes,
      price,
      discountPrice,
    } = payload;
    if (
      typeof name !== "string" ||
      !isServiceType(serviceType) ||
      !isPropertyType(propertyType) ||
      !isValidServiceAreas(propertyType, areaTypes) ||
      typeof durationMinutes !== "number" ||
      typeof price !== "number"
    ) {
      return errorResponse("Name, property type, area type, service type, duration, and price are required.", 400);
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      return errorResponse("Service name must be between 1 and 100 characters.", 400);
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 1440) {
      return errorResponse("Duration must be between 15 and 1440 minutes.", 400);
    }
    if (!Number.isFinite(price) || price < 0 || price > 10_000_000) {
      return errorResponse("Price must be between 0 and 10000000.", 400);
    }
    if (
      discountPrice !== null &&
      discountPrice !== undefined &&
      (typeof discountPrice !== "number" ||
        !Number.isFinite(discountPrice) ||
        discountPrice < 0 ||
        discountPrice >= price)
    ) {
      return errorResponse("Discount price must be less than the actual price.", 400);
    }

    await connectToDatabase();
    const category = await ServiceCategoryModel.findOne({ id: categoryId });
    if (!category) {
      return errorResponse("Service category not found.", 404);
    }

    const duplicate = category.services.some(
      (service: StoredServiceCategory["services"][number]) =>
        service.name.toLowerCase() === trimmedName.toLowerCase() &&
        (service.serviceType ?? "One time") === serviceType &&
        service.durationMinutes === durationMinutes,
    );
    if (duplicate) {
      return errorResponse("This service already exists in the category with the same type and duration.", 409);
    }

    const service = {
      id: `srv_${randomUUID()}`,
      name: trimmedName,
      serviceType,
      propertyType,
      areaTypes,
      durationMinutes,
      price,
      ...(typeof discountPrice === "number" ? { discountPrice } : {}),
      isActive: true,
    };
    category.services.push(service);
    category.services.forEach((categoryService: StoredServiceCategory["services"][number]) => {
      categoryService.propertyType = normalizeStoredPropertyType(categoryService.propertyType);
    });
    await category.save();

    return NextResponse.json(
      { category: { id: category.id, name: category.name }, service },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to add service to category:", error);
    return errorResponse("Unable to add service to category.", 500);
  }
}
