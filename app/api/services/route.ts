import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/mongodb";
import {
  isPropertyType,
  isValidServiceAreas,
  isServiceType,
  normalizeStoredPropertyType,
} from "../../../lib/service-types";
import ServiceCategoryModel, { type StoredServiceCategory } from "../../../models/ServiceCategory";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.role === "admin";
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return errorResponse("Admin authorization required.", 403);
    }

    await connectToDatabase();
    const categories = await ServiceCategoryModel.find({})
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        services: category.services.map((service: StoredServiceCategory["services"][number]) => ({
          id: service.id,
          name: service.name,
          serviceType: service.serviceType ?? "One time",
          propertyType: normalizeStoredPropertyType(service.propertyType),
          areaTypes: service.areaTypes?.length ? service.areaTypes : ["Full property"],
          durationMinutes: service.durationMinutes,
          price: service.price,
          discountPrice: service.discountPrice,
          isActive: service.isActive,
        })),
      })),
    });
  } catch (error) {
    console.error("Failed to load service categories:", error);
    return errorResponse("Unable to load service categories.", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return errorResponse("Admin authorization required.", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }

    if (typeof body !== "object" || body === null) {
      return errorResponse("Category and service details are required.", 400);
    }

    const payload = body as Record<string, unknown>;
    const {
      categoryId,
      categoryName,
      name,
      serviceType,
      propertyType,
      areaTypes,
      durationMinutes,
      price,
      discountPrice,
    } = payload;
    if (
      (typeof categoryId !== "string" && typeof categoryName !== "string") ||
      typeof name !== "string" ||
      !isServiceType(serviceType) ||
      !isPropertyType(propertyType) ||
      !isValidServiceAreas(propertyType, areaTypes) ||
      typeof durationMinutes !== "number" ||
      typeof price !== "number"
    ) {
      return errorResponse("Category, service name, property type, area type, service type, duration, and price are required.", 400);
    }

    const trimmedName = name.trim();
    const trimmedCategoryName = typeof categoryName === "string" ? categoryName.trim() : "";
    if (!trimmedName || trimmedName.length > 100) {
      return errorResponse("Service name must be between 1 and 100 characters.", 400);
    }
    if (typeof categoryId !== "string" && (!trimmedCategoryName || trimmedCategoryName.length > 100)) {
      return errorResponse("Category name must be between 1 and 100 characters.", 400);
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

    await connectToDatabase();
    let category;
    if (typeof categoryId === "string") {
      category = await ServiceCategoryModel.findOne({ id: categoryId });
      if (!category) return errorResponse("Service category not found.", 404);

      const duplicate = category.services.some(
        (existingService: StoredServiceCategory["services"][number]) =>
          existingService.name.toLowerCase() === trimmedName.toLowerCase() &&
          (existingService.serviceType ?? "One time") === serviceType &&
          existingService.durationMinutes === durationMinutes,
      );
      if (duplicate) {
        return errorResponse("This service already exists in the category with the same type and duration.", 409);
      }
      category.services.push(service);
      category.services.forEach((categoryService: StoredServiceCategory["services"][number]) => {
        categoryService.propertyType = normalizeStoredPropertyType(categoryService.propertyType);
      });
      await category.save();
    } else {
      const existingCategory = await ServiceCategoryModel.findOne({
        name: { $regex: `^${trimmedCategoryName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });
      if (existingCategory) {
        return errorResponse("This category already exists. Select it from the category list.", 409);
      }
      category = await ServiceCategoryModel.create({
        id: `cat_${randomUUID()}`,
        name: trimmedCategoryName,
        services: [service],
      });
    }

    return NextResponse.json(
      {
        category: {
          id: category.id,
          name: category.name,
          services: category.services.map((categoryService: StoredServiceCategory["services"][number]) => ({
            id: categoryService.id,
            name: categoryService.name,
            serviceType: categoryService.serviceType ?? "One time",
            propertyType: normalizeStoredPropertyType(categoryService.propertyType),
            areaTypes: categoryService.areaTypes?.length ? categoryService.areaTypes : ["Full property"],
            durationMinutes: categoryService.durationMinutes,
            price: categoryService.price,
            discountPrice: categoryService.discountPrice,
            isActive: categoryService.isActive,
          })),
        },
        service,
      },
      { status: 201 },
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return errorResponse("This category or service already exists.", 409);
    }
    console.error("Failed to save category and service:", error);
    return errorResponse("Unable to save category and service.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin())) {
      return errorResponse("Admin authorization required.", 403);
    }

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
      categoryId,
      serviceId,
      name,
      serviceType,
      propertyType,
      areaTypes,
      durationMinutes,
      price,
      discountPrice,
    } = payload;
    if (
      typeof categoryId !== "string" ||
      typeof serviceId !== "string" ||
      typeof name !== "string" ||
      !isServiceType(serviceType) ||
      !isPropertyType(propertyType) ||
      !isValidServiceAreas(propertyType, areaTypes) ||
      typeof durationMinutes !== "number" ||
      typeof price !== "number"
    ) {
      return errorResponse("Category, service, name, property type, area type, service type, duration, and actual price are required.", 400);
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      return errorResponse("Service name must be between 1 and 100 characters.", 400);
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 1440) {
      return errorResponse("Duration must be between 15 and 1440 minutes.", 400);
    }
    if (!Number.isFinite(price) || price < 0 || price > 10_000_000) {
      return errorResponse("Actual price must be between 0 and 10000000.", 400);
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
    if (!category) return errorResponse("Service category not found.", 404);

    const service = category.services.find(
      (item: StoredServiceCategory["services"][number]) => item.id === serviceId,
    );
    if (!service) return errorResponse("Service not found in this category.", 404);

    const duplicate = category.services.some(
      (item: StoredServiceCategory["services"][number]) =>
        item.id !== serviceId &&
        item.name.toLowerCase() === trimmedName.toLowerCase() &&
        (item.serviceType ?? "One time") === serviceType &&
        item.durationMinutes === durationMinutes,
    );
    if (duplicate) {
      return errorResponse("This service already exists in the category with the same type and duration.", 409);
    }

    service.name = trimmedName;
    service.serviceType = serviceType;
    service.propertyType = propertyType;
    service.areaTypes = areaTypes;
    service.durationMinutes = durationMinutes;
    service.price = price;
    service.discountPrice = typeof discountPrice === "number" ? discountPrice : undefined;
    category.services.forEach((categoryService: StoredServiceCategory["services"][number]) => {
      categoryService.propertyType = normalizeStoredPropertyType(categoryService.propertyType);
    });
    await category.save();

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        services: category.services.map((categoryService: StoredServiceCategory["services"][number]) => ({
          id: categoryService.id,
          name: categoryService.name,
          serviceType: categoryService.serviceType ?? "One time",
          propertyType: normalizeStoredPropertyType(categoryService.propertyType),
          areaTypes: categoryService.areaTypes?.length ? categoryService.areaTypes : ["Full property"],
          durationMinutes: categoryService.durationMinutes,
          price: categoryService.price,
          discountPrice: categoryService.discountPrice,
          isActive: categoryService.isActive,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to update service:", error);
    return errorResponse("Unable to update service.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdmin())) {
      return errorResponse("Admin authorization required.", 403);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON request body.", 400);
    }
    if (typeof body !== "object" || body === null) {
      return errorResponse("Category and service IDs are required.", 400);
    }

    const { categoryId, serviceId } = body as Record<string, unknown>;
    if (typeof categoryId !== "string" || typeof serviceId !== "string") {
      return errorResponse("Category and service IDs are required.", 400);
    }

    await connectToDatabase();
    const category = await ServiceCategoryModel.findOne({ id: categoryId });
    if (!category) return errorResponse("Service category not found.", 404);

    const serviceIndex = category.services.findIndex(
      (service: StoredServiceCategory["services"][number]) => service.id === serviceId,
    );
    if (serviceIndex < 0) return errorResponse("Service not found in this category.", 404);

    category.services.splice(serviceIndex, 1);
    category.services.forEach((categoryService: StoredServiceCategory["services"][number]) => {
      categoryService.propertyType = normalizeStoredPropertyType(categoryService.propertyType);
    });
    await category.save();

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        services: category.services.map((service: StoredServiceCategory["services"][number]) => ({
          id: service.id,
          name: service.name,
          serviceType: service.serviceType ?? "One time",
          propertyType: normalizeStoredPropertyType(service.propertyType),
          areaTypes: service.areaTypes?.length ? service.areaTypes : ["Full property"],
          durationMinutes: service.durationMinutes,
          price: service.price,
          discountPrice: service.discountPrice,
          isActive: service.isActive,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to delete service:", error);
    return errorResponse("Unable to delete service.", 500);
  }
}
