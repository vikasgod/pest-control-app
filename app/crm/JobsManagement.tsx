"use client";

import { type FormEvent, useState } from "react";
import type { CrmRole } from "./roles";
import JobAssignmentBoard, {
  type Job,
  type JobAssignmentForm,
  technicians,
} from "../../components/JobAssignmentBoard";

const initialJobs: Job[] = [
  {
    id: "JOB-2048",
    customer: "Riya Kapoor",
    service: "Cockroach Control",
    technician: "Nikhil Verma",
    status: "In progress",
    priority: "High",
    scheduled: "Today, 10:30 AM",
  },
  {
    id: "JOB-2047",
    customer: "Amit Shah",
    service: "Mosquito Control",
    technician: "Ananya Joshi",
    status: "Scheduled",
    priority: "Medium",
    scheduled: "Today, 2:00 PM",
  },
  {
    id: "JOB-2046",
    customer: "Kabir Desai",
    service: "Bed Bug Treatment",
    technician: "Mehul Shah",
    status: "Pending",
    priority: "High",
    scheduled: "Tomorrow, 9:00 AM",
  },
  {
    id: "JOB-2045",
    customer: "Priya Sharma",
    service: "Termite Inspection",
    technician: "Nikhil Verma",
    status: "Completed",
    priority: "Low",
    scheduled: "Jun 09, 2026",
  },
];

export default function JobsManagement({ role = "admin" }: { role?: CrmRole }) {
  const canEditJobAssignments = role === "admin" || role === "manager";
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [form, setForm] = useState<JobAssignmentForm>({
    customer: "",
    service: "Cockroach Control",
    technician: technicians[0],
    status: "Pending",
    priority: "Medium",
    scheduled: "Today, 11:00 AM",
  });

  function handleFormChange(field: keyof JobAssignmentForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEditJobAssignments) return;
    if (!form.customer.trim()) return;

    const nextJob: Job = {
      id: `JOB-${Math.floor(Math.random() * 9000 + 1000)}`,
      customer: form.customer.trim(),
      service: form.service,
      technician: form.technician,
      status: form.status,
      priority: form.priority,
      scheduled: form.scheduled,
    };

    setJobs((current) => [nextJob, ...current]);
    setForm({ customer: "", service: "Cockroach Control", technician: technicians[0], status: "Pending", priority: "Medium", scheduled: "Today, 11:00 AM" });
  }

  function updateJob(jobId: string, field: "status" | "technician", value: string) {
    if (!canEditJobAssignments) return;
    setJobs((current) => current.map((job) => {
      if (job.id !== jobId) return job;
      return { ...job, [field]: value };
    }));
  }

  return (
    <JobAssignmentBoard
      role={role}
      jobs={jobs}
      form={form}
      canEditJobAssignments={canEditJobAssignments}
      onFormChange={handleFormChange}
      onSubmit={handleSubmit}
      onUpdateJob={updateJob}
    />
  );
}
