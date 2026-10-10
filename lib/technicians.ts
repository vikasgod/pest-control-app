export type StaffRole = "Manager" | "Technician";

export type StaffMember = {
  id?: string;
  name: string;
  role: StaffRole;
  team: string;
  location: string;
  pincode?: string;
  assigned: number;
  status: string;
  manager?: string;
  services?: string[];
};

export const initialStaff: StaffMember[] = [
  { name: "Aisha Patel", role: "Manager", team: "North Zone", location: "Mumbai", assigned: 12, status: "Active" },
  { name: "Rohit Sethi", role: "Manager", team: "Western Zone", location: "Pune", assigned: 9, status: "On site" },
  {
    name: "Nikhil Verma",
    role: "Technician",
    team: "Termite Team",
    location: "Mumbai",
    pincode: "400050",
    assigned: 7,
    status: "Available",
    manager: "Aisha Patel",
    services: ["Cockroach Control", "Termite Control", "Mosquito Control"],
  },
  {
    name: "Ananya Joshi",
    role: "Technician",
    team: "Rodent Team",
    location: "Thane",
    pincode: "400601",
    assigned: 6,
    status: "On route",
    manager: "Rohit Sethi",
    services: ["Rodent Control", "Bed Bug Control"],
  },
  {
    name: "Mehul Shah",
    role: "Technician",
    team: "General Pest",
    location: "Navi Mumbai",
    pincode: "400703",
    assigned: 5,
    status: "Available",
    manager: "Aisha Patel",
    services: [
      "Cockroach Control",
      "Termite Control",
      "Bed Bug Control",
      "Mosquito Control",
      "Rodent Control",
    ],
  },
];

export const serviceOptions = [
  "Cockroach Control",
  "Termite Control",
  "Bed Bug Control",
  "Mosquito Control",
  "Rodent Control",
] as const;

export const staffStatusOptions = [
  "Active",
  "On site",
  "Available",
  "On route",
  "Busy",
  "On leave",
] as const;

export const timeSlotOptions = [
  "09:00 AM - 12:00 PM",
  "12:00 PM - 03:00 PM",
  "03:00 PM - 06:00 PM",
] as const;
