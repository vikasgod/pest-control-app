import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { serviceOptions, timeSlotOptions } from "../lib/technicians";

const serviceBookingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true, maxlength: 500 },
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    serviceType: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    technicianId: { type: String, required: true },
    technicianName: { type: String, required: true },
    requestedService: { type: String, required: true, enum: serviceOptions },
    pincode: { type: String, required: true, match: /^\d{6}$/ },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    timeSlot: { type: String, required: true, enum: timeSlotOptions },
    status: { type: String, required: true, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  },
  { timestamps: true },
);

export type StoredServiceBooking = InferSchemaType<typeof serviceBookingSchema>;

if (process.env.NODE_ENV === "development" && mongoose.models.ServiceBooking) {
  mongoose.deleteModel("ServiceBooking");
}

const ServiceBookingModel =
  mongoose.models.ServiceBooking ??
  mongoose.model("ServiceBooking", serviceBookingSchema);

export default ServiceBookingModel;
