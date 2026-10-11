import mongoose, { Schema, type InferSchemaType } from "mongoose";

const leadSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    location: { type: String, required: true, trim: true, maxlength: 300 },
    service: { type: String, required: true, trim: true, maxlength: 120 },
    propertyType: { type: String, required: true, trim: true, maxlength: 100 },
    issueDetails: { type: String, required: true, trim: true, maxlength: 2000 },
    source: { type: String, required: true, default: "Website" },
    status: {
      type: String,
      required: true,
      enum: ["New", "Assigned", "Quoted", "Accepted", "Declined"],
      default: "New",
    },
    managerName: { type: String, trim: true },
    assignedTechnicianId: { type: String, trim: true },
    assignedTechnicianName: { type: String, trim: true },
    quoteAmount: { type: Number, min: 0 },
    quoteDetails: { type: String, trim: true, maxlength: 2000 },
    quoteTokenHash: { type: String, select: false },
    quoteExpiresAt: { type: Date },
    quotedAt: { type: Date },
    customerDecisionAt: { type: Date },
  },
  { timestamps: true },
);

export type StoredLead = InferSchemaType<typeof leadSchema>;

if (process.env.NODE_ENV === "development" && mongoose.models.Lead) {
  mongoose.deleteModel("Lead");
}

const LeadModel = mongoose.models.Lead ?? mongoose.model("Lead", leadSchema);

export default LeadModel;
