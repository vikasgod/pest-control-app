"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import type { CrmRole } from "../app/crm/roles";
import {
  isPropertyType,
  isServiceType,
  propertyTypes,
  serviceAreaTypesByProperty,
  isValidServiceAreas,
  serviceTypes,
  type PropertyType,
  type ServiceAreaType,
} from "../lib/service-types";
import ServiceSearch from "./serviceSearch";

type ServiceItem = {
  id: string;
  name: string;
  serviceType: (typeof serviceTypes)[number];
  propertyType: (typeof propertyTypes)[number];
  areaTypes: ServiceAreaType[];
  durationMinutes: number;
  price: number;
  discountPrice?: number;
  isActive: boolean;
};

type ServiceCategory = {
  id: string;
  name: string;
  services: ServiceItem[];
};

type CreatedServiceResponse = {
  category: ServiceCategory;
  service: ServiceItem;
};

function isServiceCategoryResponse(
  value: unknown,
): value is { category: ServiceCategory } {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    isServiceCategory(value.category)
  );
}

function isCreatedServiceResponse(
  value: unknown,
): value is CreatedServiceResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    isServiceCategory(value.category) &&
    "service" in value &&
    isServiceItem(value.service)
  );
}

function isServiceItem(value: unknown): value is ServiceItem {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "serviceType" in value &&
    isServiceType(value.serviceType) &&
    "propertyType" in value &&
    isPropertyType(value.propertyType) &&
    "areaTypes" in value &&
    isValidServiceAreas(value.propertyType, value.areaTypes) &&
    "durationMinutes" in value &&
    typeof value.durationMinutes === "number" &&
    "price" in value &&
    typeof value.price === "number" &&
    (!("discountPrice" in value) ||
      value.discountPrice === undefined ||
      typeof value.discountPrice === "number") &&
    "isActive" in value &&
    typeof value.isActive === "boolean"
  );
}

function isServiceCategory(value: unknown): value is ServiceCategory {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "services" in value &&
    Array.isArray(value.services) &&
    value.services.every(isServiceItem)
  );
}

function getApiError(result: unknown, fallback: string) {
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "string"
  ) {
    return result.error;
  }
  return fallback;
}

export default function ServiceManagement({ role }: { role: CrmRole }) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [propertyType, setPropertyType] = useState<PropertyType>("1 BHK");
  const [selectedAreaTypes, setSelectedAreaTypes] = useState<ServiceAreaType[]>(
    ["Full property"],
  );
  const [categoryChoice, setCategoryChoice] = useState("new");
  const [editingService, setEditingService] = useState<{
    categoryId: string;
    categoryName: string;
    service: ServiceItem;
  } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchResults, setSearchResults] = useState<ServiceCategory[] | null>(
    null,
  );

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/services");
      const result: unknown = await response.json();
      if (!response.ok)
        throw new Error(
          getApiError(result, "Unable to load service categories."),
        );
      if (
        typeof result !== "object" ||
        result === null ||
        !("categories" in result) ||
        !Array.isArray(result.categories) ||
        !result.categories.every(isServiceCategory)
      ) {
        throw new Error("The service categories response was invalid.");
      }
      setCategories(result.categories);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load service categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  async function createCategoryService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedAreaTypes = formData.getAll("areaTypes").map(String);
    if (selectedAreaTypes.length === 0) {
      setError("Select at least one area type for this service.");
      return;
    }
    setIsSaving(true);
    setError("");
    setNotice("");

    const payload = {
      ...(editingService
        ? {
            categoryId: editingService.categoryId,
            serviceId: editingService.service.id,
          }
        : categoryChoice === "new"
          ? { categoryName: String(formData.get("categoryName") ?? "").trim() }
          : { categoryId: categoryChoice }),
      name: String(formData.get("serviceName") ?? "").trim(),
      serviceType: String(formData.get("serviceType") ?? ""),
      propertyType: String(formData.get("propertyType") ?? ""),
      areaTypes: selectedAreaTypes,
      durationMinutes: Number(formData.get("durationMinutes")),
      price: Number(formData.get("price")),
      discountPrice: hasDiscount ? Number(formData.get("discountPrice")) : null,
    };

    try {
      const response = await fetch("/api/services", {
        method: editingService ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json();
      if (!response.ok)
        throw new Error(
          getApiError(
            result,
            editingService
              ? "Unable to update service."
              : "Unable to save category and service.",
          ),
        );
      let savedCategory: ServiceCategory;
      let savedServiceName: string;
      if (editingService) {
        if (!isServiceCategoryResponse(result)) {
          throw new Error("The updated service response was invalid.");
        }
        savedCategory = result.category;
        savedServiceName =
          savedCategory.services.find(
            (service) => service.id === editingService.service.id,
          )?.name ?? editingService.service.name;
      } else {
        if (!isCreatedServiceResponse(result)) {
          throw new Error(
            "The saved category and service response was invalid.",
          );
        }
        savedCategory = result.category;
        savedServiceName = result.service.name;
      }

      setCategories((current) => {
        const exists = current.some(
          (category) => category.id === savedCategory.id,
        );
        return exists
          ? current.map((category) =>
              category.id === savedCategory.id ? savedCategory : category,
            )
          : [savedCategory, ...current];
      });
      setCategoryChoice(savedCategory.id);
      setHasDiscount(false);
      setEditingService(null);
      setIsFormOpen(false);
      setNotice(
        editingService
          ? `"${savedServiceName}" updated.`
          : `"${savedServiceName}" saved under ${savedCategory.name}.`,
      );
      form.reset();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save category and service.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function openAddForm() {
    setError("");
    setNotice("");
    setEditingService(null);
    setCategoryChoice("new");
    setHasDiscount(false);
    setPropertyType("1 BHK");
    setSelectedAreaTypes(["Full property"]);
    setIsFormOpen(true);
  }

  function openEditForm(category: ServiceCategory, service: ServiceItem) {
    setError("");
    setNotice("");
    setEditingService({
      categoryId: category.id,
      categoryName: category.name,
      service,
    });
    setCategoryChoice(category.id);
    setHasDiscount(service.discountPrice !== undefined);
    setPropertyType(service.propertyType);
    setSelectedAreaTypes(service.areaTypes);
    setIsFormOpen(true);
  }

  function changePropertyType(nextPropertyType: PropertyType) {
    setPropertyType(nextPropertyType);
    const nextAreas = serviceAreaTypesByProperty[nextPropertyType];
    const fullArea = nextAreas.find((area) => area.startsWith("Full "));
    setSelectedAreaTypes(fullArea ? [fullArea] : [nextAreas[0]]);
  }

  function toggleAreaType(areaType: ServiceAreaType) {
    setSelectedAreaTypes((current) =>
      current.includes(areaType)
        ? current.filter((area) => area !== areaType)
        : [...current, areaType],
    );
  }

  async function deleteService(
    category: ServiceCategory,
    service: ServiceItem,
  ) {
    const confirmed = window.confirm(
      `Delete "${service.name}" from ${category.name}?`,
    );
    if (!confirmed) return;

    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: category.id,
          serviceId: service.id,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok)
        throw new Error(getApiError(result, "Unable to delete service."));
      if (!isServiceCategoryResponse(result)) {
        throw new Error("The deleted service response was invalid.");
      }

      setCategories((current) =>
        current.map((currentCategory) =>
          currentCategory.id === result.category.id
            ? result.category
            : currentCategory,
        ),
      );
      setNotice(`"${service.name}" deleted.`);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete service.",
      );
    }
  }

  if (role !== "admin") {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
        Only admins can manage service categories and services.
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Service catalog
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Services
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a category and its service together, or choose an existing
            category.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
        >
          <Plus size={17} /> Create Service
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700"
        >
          {notice}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-black">Categories and services</h3>
            <p className="text-sm text-slate-500">
              {categories.length} categories ·{" "}
              {categories.reduce(
                (sum, category) => sum + category.services.length,
                0,
              )}{" "}
              services
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-50">
            <ServiceSearch onResults={setSearchResults} />
          </div>
          <button
            type="button"
            onClick={() => void loadCategories()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 disabled:opacity-50"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
        </div>
        {isLoading ? (
          <p className="p-8 text-center text-sm text-slate-500">
            Loading categories...
          </p>
        ) : (searchResults ?? categories).length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">
            No matching categories or services found.
          </p>
        ) : (
          <div className="space-y-4 p-5">
            {(searchResults ?? categories).map((category) => (
              <article
                key={category.id}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-5 py-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                      {category.id}
                    </p>
                    <h4 className="mt-1 text-lg font-black text-[#102a33]">
                      {category.name}
                    </h4>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                    {category.services.length} services
                  </span>
                </div>
                {category.services.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-slate-500">
                    No services in this category yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {category.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-bold text-[#102a33]">
                            {service.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {service.serviceType} · {service.propertyType}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {service.areaTypes.join(", ")}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Duration : {service.durationMinutes} minutes
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditForm(category, service)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            aria-label={`Edit ${service.name}`}
                          >
                            <Pencil size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void deleteService(category, service)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                            aria-label={`Delete ${service.name}`}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${service.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {service.isActive ? "Active" : "Inactive"}
                          </span>
                          <div className="flex flex-col items-end">
                            {service.discountPrice !== undefined ? (
                              <>
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{service.price.toLocaleString("en-IN")}
                                </span>
                                <strong className="text-lg text-emerald-700">
                                  ₹
                                  {service.discountPrice.toLocaleString(
                                    "en-IN",
                                  )}
                                </strong>
                              </>
                            ) : (
                              <strong className="text-lg text-[#102a33]">
                                ₹{service.price.toLocaleString("en-IN")}
                              </strong>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4"
          onClick={() => !isSaving && setIsFormOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-form-title"
            className="my-auto w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck size={16} /> Admin service setup
              </span>
              <h3 id="service-form-title" className="mt-1 text-xl font-black">
                {editingService ? "Edit service" : "Add category and service"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {editingService
                  ? `Update ${editingService.service.name} in ${editingService.categoryName}.`
                  : "Choose a category and service type; all details save together."}
              </p>
            </div>
            <form
              onSubmit={createCategoryService}
              className="grid gap-4 sm:grid-cols-2"
            >
              {editingService ? (
                <div className="sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Category
                  </span>
                  <p className="mt-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
                    {editingService.categoryName}
                  </p>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                    Category
                    <select
                      name="categoryChoice"
                      value={categoryChoice}
                      onChange={(event) =>
                        setCategoryChoice(event.target.value)
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600"
                    >
                      <option value="new">Create a new category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {categoryChoice === "new" && (
                    <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                      New category name
                      <input
                        name="categoryName"
                        required
                        maxLength={100}
                        placeholder="e.g. Cockroach Control"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none placeholder:text-slate-400 focus:border-emerald-600"
                      />
                    </label>
                  )}
                </>
              )}
              <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                Service name
                <input
                  name="serviceName"
                  required
                  maxLength={100}
                  defaultValue={editingService?.service.name}
                  placeholder="e.g. Cockroach Gel Treatment"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none placeholder:text-slate-400 focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Service type
                <select
                  name="serviceType"
                  required
                  defaultValue={
                    editingService?.service.serviceType ?? serviceTypes[0]
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600"
                >
                  {serviceTypes.map((serviceType) => (
                    <option key={serviceType} value={serviceType}>
                      {serviceType}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Property type
                <select
                  name="propertyType"
                  required
                  value={propertyType}
                  onChange={(event) => {
                    if (isPropertyType(event.target.value)) {
                      changePropertyType(event.target.value);
                    }
                  }}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600"
                >
                  {propertyTypes.map((propertyType) => (
                    <option key={propertyType} value={propertyType}>
                      {propertyType}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-semibold text-slate-700">
                  Area type (select one or more)
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {serviceAreaTypesByProperty[propertyType].map((areaType) => (
                    <label
                      key={areaType}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="areaTypes"
                        value={areaType}
                        checked={selectedAreaTypes.includes(areaType)}
                        onChange={() => toggleAreaType(areaType)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                      />
                      {areaType}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-semibold text-slate-700">
                Duration (minutes)
                <input
                  name="durationMinutes"
                  type="number"
                  min="15"
                  max="1440"
                  step="15"
                  required
                  defaultValue={editingService?.service.durationMinutes ?? 60}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                Actual price (₹)
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  max="10000000"
                  step="0.01"
                  required
                  defaultValue={editingService?.service.price}
                  placeholder="e.g. 2500"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2 self-end pb-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(event) => setHasDiscount(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                Add discount
              </label>
              {hasDiscount && (
                <label className="block text-sm font-semibold text-slate-700">
                  Discount price (₹)
                  <input
                    name="discountPrice"
                    type="number"
                    min="0"
                    max="9999999.99"
                    step="0.01"
                    required
                    defaultValue={editingService?.service.discountPrice}
                    placeholder="Enter discounted amount"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-normal outline-none focus:border-emerald-600"
                  />
                </label>
              )}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:col-span-2"
                >
                  {error}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingService(null);
                  }}
                  disabled={isSaving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? "Saving..."
                    : editingService
                      ? "Save changes"
                      : "Add"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
