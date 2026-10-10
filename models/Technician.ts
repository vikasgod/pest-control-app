import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { serviceOptions } from "../lib/technicians";

const technicianSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, enum: ["Manager", "Technician"] },
    team: { type: String, required: true, trim: true, maxlength: 100 },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    pincode: { type: String, match: /^\d{6}$/ },
    assigned: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ["Active", "On site", "Available", "On route", "Busy", "On leave"],
      default: "Available",
    },
    manager: { type: String, trim: true },
    services: { type: [String], enum: serviceOptions, default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type StoredTechnician = InferSchemaType<typeof technicianSchema>;

if (process.env.NODE_ENV === "development" && mongoose.models.Technician) {
  mongoose.deleteModel("Technician");
}

const TechnicianModel =
  mongoose.models.Technician ?? mongoose.model("Technician", technicianSchema);

export default TechnicianModel;
