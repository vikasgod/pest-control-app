import { initialStaff } from "./technicians";
import TechnicianModel from "../models/Technician";

export async function ensureTechnicianRoster() {
  await TechnicianModel.bulkWrite(
    initialStaff.map((member, index) => ({
      updateOne: {
        filter: { id: `seed_staff_${index + 1}` },
        update: {
          $setOnInsert: {
            ...member,
            id: `seed_staff_${index + 1}`,
            isDeleted: false,
          },
        },
        upsert: true,
      },
    })),
  );
}
