export type CrmRole = "admin" | "manager" | "technician" | "customer";

export const roleLabels: Record<CrmRole, string> = {
  admin: "Admin",
  manager: "Manager",
  technician: "Technician",
  customer: "Customer",
};
