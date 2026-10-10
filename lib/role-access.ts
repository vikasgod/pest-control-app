export type CrmRole = "admin" | "manager" | "technician" | "customer";

export type RoleAccessEntry = {
  interfaceName: string;
  screens: string;
};

export type RolePermissions = {
  canEditJobAssignments: boolean;
  canManageStaff: boolean;
  canViewReports: boolean;
};

export const roleAccessMatrix: Record<CrmRole, RoleAccessEntry[]> = {
  admin: [
    {
      interfaceName: "Customer website",
      screens: "Home, Services, Contact, Get Quote / Book Service",
    },
    {
      interfaceName: "Admin panel",
      screens: "Dashboard, Leads, Customers, Staff, Services, Jobs, Payments, Reports, Settings",
    },
    {
      interfaceName: "Manager panel",
      screens: "Dashboard, Leads, Customers, Schedule, Job Assignments, Follow-ups",
    },
    {
      interfaceName: "Technician panel",
      screens: "Dashboard, Assigned Jobs, Job Details, Service Report, Profile",
    },
  ],
  manager: [
    {
      interfaceName: "Customer website",
      screens: "Home, Services, Contact, Get Quote / Book Service",
    },
    {
      interfaceName: "Manager panel",
      screens: "Dashboard, Leads, Customers, Schedule, Job Assignments, Follow-ups",
    },
    {
      interfaceName: "Technician panel",
      screens: "Dashboard, Assigned Jobs, Job Details, Service Report, Profile",
    },
  ],
  technician: [
    {
      interfaceName: "Customer website",
      screens: "Home, Services, Contact, Get Quote / Book Service",
    },
    {
      interfaceName: "Technician panel",
      screens: "Dashboard, Assigned Jobs, Job Details, Service Report, Profile",
    },
  ],
  customer: [
    {
      interfaceName: "Customer website",
      screens: "Home, Services, Contact, Get Quote / Book Service",
    },
  ],
};

export const rolePermissions: Record<CrmRole, RolePermissions> = {
  admin: {
    canEditJobAssignments: true,
    canManageStaff: true,
    canViewReports: true,
  },
  manager: {
    canEditJobAssignments: true,
    canManageStaff: false,
    canViewReports: true,
  },
  technician: {
    canEditJobAssignments: false,
    canManageStaff: false,
    canViewReports: false,
  },
  customer: {
    canEditJobAssignments: false,
    canManageStaff: false,
    canViewReports: false,
  },
};

export function getRoleAccess(role: CrmRole | string | null | undefined) {
  if (role === "admin" || role === "manager" || role === "technician" || role === "customer") {
    return roleAccessMatrix[role];
  }

  return roleAccessMatrix.customer;
}

export function getRolePermissions(role: CrmRole | string | null | undefined) {
  if (role === "admin" || role === "manager" || role === "technician" || role === "customer") {
    return rolePermissions[role];
  }

  return rolePermissions.customer;
}
