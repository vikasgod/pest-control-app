export type CrmDummyRole = "admin" | "manager" | "technician" | "customer";

export type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  tone: "emerald" | "amber" | "blue" | "slate";
};

export type LeadItem = {
  id: string;
  customer: string;
  service: string;
  city: string;
  source: string;
  status: "New" | "Contacted" | "Quoted" | "Won" | "Follow-up";
  value: string;
};

export type CustomerItem = {
  id: string;
  name: string;
  phone: string;
  city: string;
  service: string;
  lastService: string;
  status: "Active" | "Follow-up" | "At risk";
};

export type StaffItem = {
  id: string;
  name: string;
  role: string;
  region: string;
  manager: string;
  availability: "Available" | "Busy" | "On leave";
};

export type JobItem = {
  id: string;
  customer: string;
  service: string;
  technician: string;
  status: "Pending" | "Scheduled" | "In progress" | "Completed";
  priority: "High" | "Medium" | "Low";
  scheduled: string;
};

export type ReportItem = {
  title: string;
  value: string;
  change: string;
  period: string;
};

export type TechnicianTask = {
  id: string;
  customer: string;
  address: string;
  service: string;
  status: "Assigned" | "In progress" | "Pending review";
  due: string;
};

export type CustomerPortal = {
  profile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    plan: string;
  };
  serviceDetails: {
    issue: string;
    propertyType: string;
    preferredDate: string;
    treatmentPlan: string;
  };
  journey: { title: string; description: string }[];
};

export type CrmDummyData = {
  dashboard: {
    stats: DashboardStat[];
    recentBookings: Array<[string, string, string, string, string, string]>;
    leadPipeline: Array<[string, number, string]>;
  };
  leads: LeadItem[];
  customers: CustomerItem[];
  staff: StaffItem[];
  jobs: JobItem[];
  reports: ReportItem[];
  technicianTasks: TechnicianTask[];
  customerPortal: CustomerPortal;
};

export const crmDummyData: Record<CrmDummyRole, CrmDummyData> = {
  admin: {
    dashboard: {
      stats: [
        { label: "Total Bookings", value: "42", delta: "+12% from last week", tone: "emerald" },
        { label: "Pending Jobs", value: "18", delta: "5 urgent", tone: "amber" },
        { label: "Completed", value: "24", delta: "+8 this week", tone: "blue" },
        { label: "Today Revenue", value: "₹38,450", delta: "+15% growth", tone: "slate" },
      ],
      recentBookings: [
        ["PC-10245", "Rahul Sharma", "Cockroach Control", "Today, 10:00 AM", "Rajesh", "Confirmed"],
        ["PC-10244", "Priya Mehta", "Termite Control", "Today, 1:30 PM", "Amit", "Assigned"],
        ["PC-10243", "Amit Verma", "Bed Bug Control", "Tomorrow, 11:00 AM", "Sunil", "Pending"],
        ["PC-10242", "Neha Shah", "Mosquito Control", "Tomorrow, 4:00 PM", "Rajesh", "Completed"],
      ],
      leadPipeline: [
        ["New Leads", 124, "bg-slate-200"],
        ["Contacted", 86, "bg-blue-200"],
        ["Interested", 54, "bg-amber-200"],
        ["Quotation", 31, "bg-purple-200"],
        ["Converted", 24, "bg-emerald-500"],
      ],
    },
    leads: [
      { id: "LD-001", customer: "Riya Kapoor", service: "Cockroach Control", city: "Bandra", source: "Website", status: "Follow-up", value: "₹4,500" },
      { id: "LD-002", customer: "Amit Shah", service: "Mosquito Control", city: "Andheri", source: "Call", status: "Quoted", value: "₹6,200" },
      { id: "LD-003", customer: "Sonia Nair", service: "Bed Bug Treatment", city: "Powai", source: "Referral", status: "New", value: "₹8,400" },
      { id: "LD-004", customer: "Kabir Desai", service: "Termite Inspection", city: "Malad", source: "Google", status: "Won", value: "₹11,900" },
    ],
    customers: [
      { id: "CU-1001", name: "Riya Kapoor", phone: "+91 98765 43210", city: "Bandra", service: "Cockroach Control", lastService: "2026-05-16", status: "Active" },
      { id: "CU-1002", name: "Amit Shah", phone: "+91 98111 22556", city: "Andheri", service: "Mosquito Control", lastService: "2026-05-11", status: "Follow-up" },
      { id: "CU-1003", name: "Kabir Desai", phone: "+91 99887 44321", city: "Malad", service: "Termite Inspection", lastService: "2026-04-30", status: "At risk" },
    ],
    staff: [
      { id: "ST-101", name: "Nikhil Verma", role: "Technician", region: "West Mumbai", manager: "Arjun Mehta", availability: "Available" },
      { id: "ST-102", name: "Ananya Joshi", role: "Technician", region: "Central Mumbai", manager: "Arjun Mehta", availability: "Busy" },
      { id: "ST-103", name: "Arjun Mehta", role: "Manager", region: "Mumbai", manager: "Admin", availability: "Available" },
      { id: "ST-104", name: "Pooja Shah", role: "Support", region: "Mumbai", manager: "Admin", availability: "On leave" },
    ],
    jobs: [
      { id: "JOB-2048", customer: "Riya Kapoor", service: "Cockroach Control", technician: "Nikhil Verma", status: "In progress", priority: "High", scheduled: "Today, 10:30 AM" },
      { id: "JOB-2047", customer: "Amit Shah", service: "Mosquito Control", technician: "Ananya Joshi", status: "Scheduled", priority: "Medium", scheduled: "Today, 2:00 PM" },
      { id: "JOB-2046", customer: "Kabir Desai", service: "Bed Bug Treatment", technician: "Mehul Shah", status: "Pending", priority: "High", scheduled: "Tomorrow, 9:00 AM" },
      { id: "JOB-2045", customer: "Priya Sharma", service: "Termite Inspection", technician: "Nikhil Verma", status: "Completed", priority: "Low", scheduled: "Jun 09, 2026" },
    ],
    reports: [
      { title: "Resolved calls", value: "94%", change: "+4.2%", period: "This month" },
      { title: "Service success", value: "89%", change: "+2.1%", period: "This quarter" },
      { title: "Repeat customer", value: "31%", change: "+1.7%", period: "Last 30 days" },
    ],
    technicianTasks: [
      { id: "TS-01", customer: "Riya Kapoor", address: "Bandra West", service: "Cockroach Control", status: "In progress", due: "Today, 11:00 AM" },
      { id: "TS-02", customer: "Sonia Nair", address: "Andheri East", service: "Bed Bug Treatment", status: "Assigned", due: "Today, 2:30 PM" },
      { id: "TS-03", customer: "Amit Shah", address: "Malad West", service: "Mosquito Control", status: "Pending review", due: "Tomorrow, 10:00 AM" },
    ],
    customerPortal: {
      profile: {
        name: "Riya Kapoor",
        email: "riya.kapoor@example.com",
        phone: "+91 98765 43210",
        address: "Bandra West, Mumbai",
        plan: "Annual Pest Protection",
      },
      serviceDetails: {
        issue: "Cockroach infestation in kitchen and storage area",
        propertyType: "2 BHK apartment",
        preferredDate: "Saturday, 10:30 AM",
        treatmentPlan: "Deep spray + preventive sealing",
      },
      journey: [
        { title: "Lead generated", description: "Customer inquiry received and assigned to a manager." },
        { title: "Inspection scheduled", description: "Site review by technician before final treatment plan." },
        { title: "Follow-up care", description: "Post-treatment support and quarterly prevention check." },
      ],
    },
  },
  manager: {
    dashboard: {
      stats: [
        { label: "Assigned jobs", value: "16", delta: "+3 this week", tone: "emerald" },
        { label: "Follow-ups", value: "8", delta: "2 due today", tone: "amber" },
        { label: "Schedules", value: "11", delta: "3 confirmed", tone: "blue" },
        { label: "Team load", value: "72%", delta: "Balanced", tone: "slate" },
      ],
      recentBookings: [
        ["PC-10401", "Neha Shah", "Mosquito Control", "Today, 12:45 PM", "Nikhil", "Assigned"],
        ["PC-10402", "Ishaan Rao", "Rodent Control", "Today, 4:00 PM", "Ananya", "Scheduled"],
        ["PC-10403", "Meera Patel", "Termite Inspection", "Tomorrow, 9:00 AM", "Rohit", "Pending"],
      ],
      leadPipeline: [
        ["Warm leads", 41, "bg-blue-200"],
        ["Quoted", 18, "bg-violet-200"],
        ["Pending follow-up", 14, "bg-amber-200"],
        ["Converted", 9, "bg-emerald-500"],
      ],
    },
    leads: [
      { id: "LD-010", customer: "Meera Patel", service: "Termite Inspection", city: "Vile Parle", source: "Website", status: "Contacted", value: "₹9,800" },
      { id: "LD-011", customer: "Ishaan Rao", service: "Rodent Control", city: "Goregaon", source: "Referral", status: "Follow-up", value: "₹6,800" },
    ],
    customers: [
      { id: "CU-2001", name: "Meera Patel", phone: "+91 98122 88991", city: "Vile Parle", service: "Termite Inspection", lastService: "2026-05-01", status: "Active" },
      { id: "CU-2002", name: "Ishaan Rao", phone: "+91 97654 12098", city: "Goregaon", service: "Rodent Control", lastService: "2026-04-25", status: "Follow-up" },
    ],
    staff: [
      { id: "ST-201", name: "Nikhil Verma", role: "Technician", region: "West Mumbai", manager: "Arjun Mehta", availability: "Available" },
      { id: "ST-202", name: "Ananya Joshi", role: "Technician", region: "Central Mumbai", manager: "Arjun Mehta", availability: "Busy" },
      { id: "ST-203", name: "Rohit Sethi", role: "Technician", region: "South Mumbai", manager: "Arjun Mehta", availability: "Available" },
    ],
    jobs: [
      { id: "JOB-2301", customer: "Meera Patel", service: "Termite Inspection", technician: "Rohit Sethi", status: "Scheduled", priority: "High", scheduled: "Tomorrow, 9:00 AM" },
      { id: "JOB-2302", customer: "Ishaan Rao", service: "Rodent Control", technician: "Ananya Joshi", status: "In progress", priority: "Medium", scheduled: "Today, 4:00 PM" },
    ],
    reports: [
      { title: "Team productivity", value: "81%", change: "+6%", period: "This week" },
      { title: "Follow-up completion", value: "73%", change: "+9%", period: "This month" },
    ],
    technicianTasks: [
      { id: "TS-11", customer: "Meera Patel", address: "Vile Parle", service: "Termite Inspection", status: "Assigned", due: "Tomorrow, 9:00 AM" },
      { id: "TS-12", customer: "Ishaan Rao", address: "Goregaon", service: "Rodent Control", status: "In progress", due: "Today, 4:00 PM" },
    ],
    customerPortal: {
      profile: {
        name: "Meera Patel",
        email: "meera.patel@example.com",
        phone: "+91 98122 88991",
        address: "Vile Parle, Mumbai",
        plan: "Quarterly Pest Care",
      },
      serviceDetails: {
        issue: "Termite signs in wooden cabinets",
        propertyType: "3 BHK apartment",
        preferredDate: "Tomorrow, 9:00 AM",
        treatmentPlan: "Inspection + anti-termite trench treatment",
      },
      journey: [
        { title: "Lead assigned", description: "Qualified lead transferred to the manager team." },
        { title: "Inspection in progress", description: "Technician scheduled to inspect and verify the issue." },
        { title: "Service proposal", description: "Quote and treatment plan will be sent after inspection." },
      ],
    },
  },
  technician: {
    dashboard: {
      stats: [
        { label: "Today jobs", value: "5", delta: "2 on-site", tone: "emerald" },
        { label: "Pending review", value: "2", delta: "1 urgent", tone: "amber" },
        { label: "Completed", value: "9", delta: "+3", tone: "blue" },
      ],
      recentBookings: [
        ["PC-2101", "Riya Kapoor", "Cockroach Control", "Today, 10:30 AM", "Self", "In progress"],
        ["PC-2102", "Sonia Nair", "Bed Bug Treatment", "Today, 2:30 PM", "Self", "Assigned"],
      ],
      leadPipeline: [
        ["Assigned tasks", 5, "bg-emerald-500"],
        ["Pending notes", 2, "bg-amber-200"],
        ["Completed", 9, "bg-blue-200"],
      ],
    },
    leads: [
      { id: "LD-110", customer: "Riya Kapoor", service: "Cockroach Control", city: "Bandra", source: "Manager", status: "Follow-up", value: "₹4,500" },
      { id: "LD-111", customer: "Sonia Nair", service: "Bed Bug Treatment", city: "Andheri", source: "Manager", status: "Contacted", value: "₹8,400" },
    ],
    customers: [
      { id: "CU-3101", name: "Riya Kapoor", phone: "+91 98765 43210", city: "Bandra", service: "Cockroach Control", lastService: "2026-05-16", status: "Active" },
      { id: "CU-3102", name: "Sonia Nair", phone: "+91 96541 77411", city: "Andheri", service: "Bed Bug Treatment", lastService: "2026-05-20", status: "Follow-up" },
    ],
    staff: [
      { id: "ST-301", name: "Nikhil Verma", role: "Technician", region: "West Mumbai", manager: "Arjun Mehta", availability: "Available" },
    ],
    jobs: [
      { id: "JOB-3101", customer: "Riya Kapoor", service: "Cockroach Control", technician: "Nikhil Verma", status: "In progress", priority: "High", scheduled: "Today, 10:30 AM" },
      { id: "JOB-3102", customer: "Sonia Nair", service: "Bed Bug Treatment", technician: "Nikhil Verma", status: "Scheduled", priority: "Medium", scheduled: "Today, 2:30 PM" },
    ],
    reports: [
      { title: "Service reports submitted", value: "12", change: "+2", period: "This week" },
      { title: "Open tickets", value: "3", change: "-1", period: "Today" },
    ],
    technicianTasks: [
      { id: "TS-21", customer: "Riya Kapoor", address: "Bandra West", service: "Cockroach Control", status: "In progress", due: "Today, 11:00 AM" },
      { id: "TS-22", customer: "Sonia Nair", address: "Andheri East", service: "Bed Bug Treatment", status: "Assigned", due: "Today, 2:30 PM" },
    ],
    customerPortal: {
      profile: {
        name: "Riya Kapoor",
        email: "riya.kapoor@example.com",
        phone: "+91 98765 43210",
        address: "Bandra West, Mumbai",
        plan: "Annual Pest Protection",
      },
      serviceDetails: {
        issue: "Cockroach infestation in kitchen and storage area",
        propertyType: "2 BHK apartment",
        preferredDate: "Saturday, 10:30 AM",
        treatmentPlan: "Deep spray + preventive sealing",
      },
      journey: [
        { title: "Assigned to technician", description: "Service task assigned to the site technician." },
        { title: "Inspection", description: "Technician checking affected zones and entry points." },
        { title: "Treatment report", description: "Service report shared with the manager and customer." },
      ],
    },
  },
  customer: {
    dashboard: {
      stats: [
        { label: "Services", value: "2", delta: "Active", tone: "emerald" },
        { label: "Upcoming", value: "1", delta: "Scheduled", tone: "blue" },
        { label: "Support", value: "24/7", delta: "Open", tone: "amber" },
      ],
      recentBookings: [
        ["PC-9001", "Pest Control Visit", "Cockroach Control", "Saturday, 10:30 AM", "Manager", "Confirmed"],
      ],
      leadPipeline: [
        ["Open request", 1, "bg-emerald-500"],
        ["Inspection", 1, "bg-blue-200"],
        ["Follow-up", 1, "bg-amber-200"],
      ],
    },
    leads: [
      { id: "LD-900", customer: "Riya Kapoor", service: "Cockroach Control", city: "Bandra", source: "Website", status: "Won", value: "₹4,500" },
    ],
    customers: [
      { id: "CU-9001", name: "Riya Kapoor", phone: "+91 98765 43210", city: "Bandra", service: "Cockroach Control", lastService: "2026-05-16", status: "Active" },
    ],
    staff: [
      { id: "ST-901", name: "Arjun Mehta", role: "Manager", region: "Mumbai", manager: "Admin", availability: "Available" },
    ],
    jobs: [
      { id: "JOB-9001", customer: "Riya Kapoor", service: "Cockroach Control", technician: "Nikhil Verma", status: "Scheduled", priority: "High", scheduled: "Saturday, 10:30 AM" },
    ],
    reports: [
      { title: "Service history", value: "2 visits", change: "+1", period: "Last year" },
      { title: "Plan status", value: "Active", change: "Updated", period: "Current plan" },
    ],
    technicianTasks: [
      { id: "TS-90", customer: "Riya Kapoor", address: "Bandra West", service: "Cockroach Control", status: "Assigned", due: "Saturday, 10:30 AM" },
    ],
    customerPortal: {
      profile: {
        name: "Riya Kapoor",
        email: "riya.kapoor@example.com",
        phone: "+91 98765 43210",
        address: "Bandra West, Mumbai",
        plan: "Annual Pest Protection",
      },
      serviceDetails: {
        issue: "Cockroach infestation in kitchen and storage area",
        propertyType: "2 BHK apartment",
        preferredDate: "Saturday, 10:30 AM",
        treatmentPlan: "Deep spray + preventive sealing",
      },
      journey: [
        { title: "Service booked", description: "Customer request created and assigned to a manager." },
        { title: "Inspection", description: "Technician will confirm the affected areas and treatment plan." },
        { title: "Service delivered", description: "Completed job with preventive care instructions and follow-up." },
      ],
    },
  },
};

export function getCrmDummyData(role: CrmDummyRole | string | null | undefined) {
  if (role === "admin" || role === "manager" || role === "technician" || role === "customer") {
    return crmDummyData[role];
  }

  return crmDummyData.customer;
}
