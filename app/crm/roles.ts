export type CrmRole = "admin" | "agent" | "user";

export const roleLabels: Record<CrmRole, string> = {
  admin: "Admin",
  agent: "Agent",
  user: "User",
};
