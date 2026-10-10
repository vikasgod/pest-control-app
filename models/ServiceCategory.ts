import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { propertyTypes, serviceAreaTypes, serviceTypes } from "../lib/service-types";

const categoryServiceSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    serviceType: { type: String, required: true, enum: serviceTypes, default: "One time" },
    propertyType: { type: String, required: true, enum: propertyTypes, default: "1 BHK" },
    areaTypes: { type: [String], required: true, enum: serviceAreaTypes, default: ["Full property"] },
    durationMinutes: { type: Number, required: true, min: 15 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false, timestamps: true },
);

const serviceCategorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100, unique: true },
    services: { type: [categoryServiceSchema], default: [] },
  },
  { timestamps: true },
);

export type StoredServiceCategory = InferSchemaType<typeof serviceCategorySchema>;

if (process.env.NODE_ENV === "development" && mongoose.models.ServiceCategory) {
  mongoose.deleteModel("ServiceCategory");
}

const ServiceCategoryModel =
  mongoose.models.ServiceCategory ??
  mongoose.model("ServiceCategory", serviceCategorySchema);

export default ServiceCategoryModel;
