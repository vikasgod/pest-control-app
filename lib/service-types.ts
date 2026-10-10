export const serviceTypes = ["One time", "Monthly", "Quarterly", "Yearly"] as const;

export type ServiceType = (typeof serviceTypes)[number];

export const propertyTypes = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "Commercial", "Industrial", "Other"] as const;

export type PropertyType = (typeof propertyTypes)[number];

export const serviceAreaTypesByProperty = {
  "1 BHK": ["Kitchen", "Hall", "Bedroom", "Bathroom", "Balcony", "Full property"],
  "2 BHK": ["Kitchen", "Hall", "Bedroom 1", "Bedroom 2", "Bathroom", "Balcony", "Full property"],
  "3 BHK": ["Kitchen", "Hall", "Bedroom 1", "Bedroom 2", "Bedroom 3", "Bathroom", "Balcony", "Full property"],
  "4 BHK": ["Kitchen", "Hall", "Bedroom 1", "Bedroom 2", "Bedroom 3", "Bedroom 4", "Bathroom", "Balcony", "Full property"],
  Commercial: ["Office", "Shop", "Kitchen", "Hall", "Bathroom", "Full property"],
  Industrial: ["Production area", "Warehouse", "Office", "Bathroom", "Full facility"],
  Other: ["General area", "Full property"],
} as const satisfies Record<PropertyType, readonly string[]>;

export type ServiceAreaType = (typeof serviceAreaTypesByProperty)[PropertyType][number];
export const serviceAreaTypes = [...new Set(Object.values(serviceAreaTypesByProperty).flat())];

export function normalizeStoredPropertyType(value: string | undefined): PropertyType {
  if (value === undefined || value === "Residential") return "1 BHK";
  if (isPropertyType(value)) return value;
  throw new Error(`Unsupported stored property type: ${value}`);
}

export function isServiceType(value: unknown): value is ServiceType {
  return typeof value === "string" && serviceTypes.some((serviceType) => serviceType === value);
}

export function isPropertyType(value: unknown): value is PropertyType {
  return typeof value === "string" && propertyTypes.some((propertyType) => propertyType === value);
}

export function isServiceAreaTypes(value: unknown): value is ServiceAreaType[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((area) =>
      typeof area === "string" &&
      Object.values(serviceAreaTypesByProperty).some((areas) =>
        areas.some((allowedArea) => allowedArea === area),
      ),
    )
  );
}

export function isValidServiceAreas(propertyType: PropertyType, areaTypes: unknown): areaTypes is ServiceAreaType[] {
  const allowedAreas = serviceAreaTypesByProperty[propertyType];
  return (
    Array.isArray(areaTypes) &&
    areaTypes.length > 0 &&
    areaTypes.every(
      (area) =>
        typeof area === "string" &&
        allowedAreas.some((allowedArea) => allowedArea === area),
    )
  );
}
