"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  CircleDot,
  CircleHelp,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
  Tags,
  Trash2,
  UserRound,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";
import {
  initialStaff,
  serviceOptions,
  staffStatusOptions,
  type StaffMember,
  type StaffRole,
} from "../../lib/technicians";
import type { CrmRole } from "./roles";

type StaffForm = {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  team: string;
  location: string;
  pincode: string;
  services: string[];
  manager: string;
  status: string;
};

type StaffConfirmation = {
  action: "edit" | "delete";
  member: StaffMember;
};

const emptyForm: StaffForm = {
  name: "",
  email: "",
  password: "",
  role: "Technician",
  team: "",
  location: "",
  pincode: "",
  services: [serviceOptions[0]],
  manager: "Aisha Patel",
  status: "Available",
};

type StaffManagementProps = {
  role: CrmRole;
  managerName?: string;
};

export default function StaffManagement({ role, managerName }: StaffManagementProps) {
  const isManager = role === "manager";
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [form, setForm] = useState<StaffForm>({
    ...emptyForm,
    ...(isManager ? { role: "Technician" as const, manager: managerName ?? "" } : {}),
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<StaffConfirmation | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/technicians")
      .then(async (response) => {
        const result: { staff?: StaffMember[]; error?: string } = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Unable to load staff.");
        if (isMounted && result.staff) setStaff(result.staff);
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load staff.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const managers = staff.filter((member) => member.role === "Manager").length;
    const technicians = staff.filter((member) => member.role === "Technician").length;
    return [
      { label: "Total staff", value: String(staff.length), detail: "Across all teams" },
      { label: "Managers", value: String(managers), detail: "Active team leads" },
      { label: "Technicians", value: String(technicians), detail: "Field execution" },
      { label: "Utilization", value: "86%", detail: "Team capacity" },
    ];
  }, [staff]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !form.name.trim() ||
      (!editingId &&
        (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ||
          form.email.trim().length > 254 ||
          form.password.length < 8 ||
          form.password.length > 128)) ||
      !form.team.trim() ||
      !form.location.trim() ||
      (form.role === "Technician" &&
        (!/^\d{6}$/.test(form.pincode) || form.services.length === 0))
    ) return;

    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/technicians", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          name: form.name.trim(),
          role: form.role,
          ...(!editingId
            ? { email: form.email.trim().toLowerCase(), password: form.password }
            : {}),
          team: form.team.trim(),
          location: form.location.trim(),
          ...(form.role === "Technician"
            ? { pincode: form.pincode, services: form.services }
            : {}),
          manager: form.manager,
          status: form.status,
        }),
      });
      const result: { staff?: StaffMember; error?: string } = await response.json();
      const addedStaff = result.staff;
      if (!response.ok || !addedStaff) {
        throw new Error(result.error ?? "Unable to add staff member.");
      }
      setStaff((current) =>
        editingId
          ? current.map((member) => (member.id === editingId ? addedStaff : member))
          : [...current, addedStaff],
      );
      setForm({
        ...emptyForm,
        ...(isManager ? { role: "Technician" as const, manager: managerName ?? "" } : {}),
      });
      setEditingId(null);
      setIsFormOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save staff member.");
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(member: StaffMember) {
    if (!member.id) {
      setError("This staff member cannot be edited because it has no saved ID.");
      return;
    }
    setError("");
    setEditingId(member.id);
    setIsFormOpen(true);
    setForm({
      name: member.name,
      email: member.email ?? "",
      password: "",
      role: member.role,
      team: member.team,
      location: member.location,
      pincode: member.pincode ?? "",
      services: member.services?.length ? member.services : [serviceOptions[0]],
      manager: member.manager ?? "",
      status: member.status,
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setIsFormOpen(false);
    setForm({
      ...emptyForm,
      ...(isManager ? { role: "Technician" as const, manager: managerName ?? "" } : {}),
    });
    setError("");
  }

  async function deleteStaff(member: StaffMember) {
    if (!member.id) {
      setError("This staff member cannot be deleted because it has no saved ID.");
      return;
    }

    setDeletingId(member.id);
    setError("");
    try {
      const response = await fetch("/api/technicians", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to delete staff member.");

      setStaff((current) => current.filter((entry) => entry.id !== member.id));
      if (editingId === member.id) cancelEditing();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete staff member.");
    } finally {
      setDeletingId(null);
    }
  }

  async function confirmStaffAction() {
    if (!confirmation) return;

    const { action, member } = confirmation;
    setConfirmation(null);
    if (action === "edit") {
      startEditing(member);
      return;
    }
    await deleteStaff(member);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Team management</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Staff</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("");
            setEditingId(null);
            setForm({
              ...emptyForm,
              ...(isManager ? { role: "Technician" as const, manager: managerName ?? "" } : {}),
            });
            setIsFormOpen(true);
          }}
          className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800"
        >
          {isManager ? "Add technician" : "Add staff"}
        </button>
      </div>

      {error && !isFormOpen && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-6"
          onClick={() => !isSaving && cancelEditing()}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-form-title"
            className="my-auto flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  {editingId ? <UserRound size={23} /> : <UserRoundPlus size={23} />}
                </span>
                <div>
                  <h3 id="staff-form-title" className="text-xl font-black text-slate-900 sm:text-2xl">
                    {editingId ? "Edit Staff" : isManager ? "Add Technician" : "Add Staff"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">Enter staff and service assignment details.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                aria-label="Close staff form"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <X size={22} />
              </button>
            </header>
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5 sm:px-8 sm:py-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                    <UserRound size={18} />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800">Basic Information</h4>
                    <p className="mt-0.5 text-sm text-slate-500">Add staff details and assign their role.</p>
                  </div>
                </div>

                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Name <span className="text-red-500">*</span>
                    <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10">
                      <UserRound size={17} className="shrink-0 text-slate-500" />
                      <input
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Enter staff name"
                        required
                        maxLength={100}
                        className="w-full bg-transparent py-3 text-sm font-normal outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>
                  {!editingId && (
                    <>
                      <label className="block text-sm font-semibold text-slate-700">
                        Email address <span className="text-red-500">*</span>
                        <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600">
                          <input
                            type="email"
                            value={form.email}
                            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                            placeholder="staff@example.com"
                            autoComplete="email"
                            maxLength={254}
                            required
                            className="w-full bg-transparent py-3 text-sm font-normal outline-none placeholder:text-slate-400"
                          />
                        </span>
                      </label>
                      <label className="block text-sm font-semibold text-slate-700">
                        Password <span className="text-red-500">*</span>
                        <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600">
                          <input
                            type="password"
                            value={form.password}
                            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={128}
                            required
                            className="w-full bg-transparent py-3 text-sm font-normal outline-none placeholder:text-slate-400"
                          />
                        </span>
                      </label>
                    </>
                  )}
                  {!isManager && (
                    <label className="block text-sm font-semibold text-slate-700">
                      Role <span className="text-red-500">*</span>
                      <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600">
                        <ShieldCheck size={17} className="shrink-0 text-slate-500" />
                        <select
                          value={form.role}
                          onChange={(event) => {
                            const role = event.target.value as StaffRole;
                            setForm((current) => ({ ...current, role, status: role === "Manager" ? "Active" : "Available" }));
                          }}
                          className="w-full appearance-none bg-transparent py-3 text-sm font-normal outline-none"
                        >
                          <option value="Manager">Manager</option>
                          <option value="Technician">Technician</option>
                        </select>
                      </span>
                    </label>
                  )}
                  <label className="block text-sm font-semibold text-slate-700">
                    Team <span className="text-red-500">*</span>
                    <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600">
                      <UsersRound size={17} className="shrink-0 text-slate-500" />
                      <input
                        value={form.team}
                        onChange={(event) => setForm((current) => ({ ...current, team: event.target.value }))}
                        placeholder="e.g. North Zone"
                        required
                        maxLength={100}
                        className="w-full bg-transparent py-3 text-sm font-normal outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>
                  <label className="block text-sm font-semibold text-slate-700">
                    Location <span className="text-red-500">*</span>
                    <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600">
                      <MapPin size={17} className="shrink-0 text-slate-500" />
                      <input
                        value={form.location}
                        onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                        placeholder="e.g. Mumbai"
                        required
                        maxLength={100}
                        className="w-full bg-transparent py-3 text-sm font-normal outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>
                </div>

                {form.role === "Technician" && (
                  <div className="grid gap-x-6 gap-y-5 border-b border-slate-200 pb-6 sm:grid-cols-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Service Pincode <span className="text-red-500">*</span>
                      <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10">
                        <MapPin size={17} className="shrink-0 text-slate-500" />
                        <input
                          value={form.pincode}
                          onChange={(event) => setForm((current) => ({ ...current, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
                          inputMode="numeric"
                          pattern="\d{6}"
                          maxLength={6}
                          required
                          placeholder="400050"
                          className="w-full bg-transparent py-3 text-sm font-normal outline-none placeholder:text-slate-400"
                        />
                      </span>
                    </label>
                    <fieldset className="sm:col-span-2">
                      <legend className="text-sm font-semibold text-slate-700">
                        Service Specialties <span className="text-red-500">*</span>
                      </legend>
                      <div className="mt-2 flex min-h-14 flex-wrap items-center gap-2 rounded-xl border border-slate-200 p-2.5">
                        <Tags size={17} className="mx-1 shrink-0 text-slate-500" />
                        {serviceOptions.map((service) => {
                          const selected = form.services.includes(service);
                          return (
                            <button
                              key={service}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setForm((current) => ({
                                ...current,
                                services: selected
                                  ? current.services.filter((item) => item !== service)
                                  : [...current.services, service],
                              }))}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${selected ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                            >
                              {service}{selected ? "  ×" : ""}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-1.5 text-xs text-slate-500">Select all services this technician can provide.</p>
                      {form.services.length === 0 && (
                        <p className="mt-1 text-xs font-medium text-red-600">Select at least one service specialty.</p>
                      )}
                    </fieldset>
                  </div>
                )}

                <div className="grid gap-5 border-b border-slate-200 pb-6 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
                        <CircleDot size={17} />
                      </span>
                      <label htmlFor="staff-status" className="text-sm font-bold text-slate-800">Status</label>
                    </div>
                    <span className="ml-9 mt-2 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600">
                      <span className={`h-2.5 w-2.5 rounded-full ${form.status === "Available" || form.status === "Active" ? "bg-emerald-600" : form.status === "On leave" ? "bg-red-500" : "bg-amber-500"}`} />
                      <select id="staff-status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full bg-transparent py-3 text-sm outline-none">
                        {staffStatusOptions.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </span>
                  </div>
                  {form.role === "Technician" && (
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
                          <UserRound size={17} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Assign Manager</p>
                          <p className="text-xs text-slate-500">Select the manager for this staff member.</p>
                        </div>
                      </div>
                      <span className="ml-9 mt-2 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-emerald-600">
                        <UserRound size={17} className="shrink-0 text-slate-500" />
                        {isManager ? (
                          <span className="w-full py-3 text-sm">{managerName}</span>
                        ) : (
                          <select value={form.manager} onChange={(event) => setForm((current) => ({ ...current, manager: event.target.value }))} className="w-full bg-transparent py-3 text-sm outline-none">
                            <option value="">Select manager</option>
                            {staff.filter((entry) => entry.role === "Manager").map((manager) => (
                              <option key={manager.id ?? manager.name} value={manager.name}>{manager.name}</option>
                            ))}
                          </select>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
              </div>
              <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                <button type="button" onClick={cancelEditing} disabled={isSaving} className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving || (form.role === "Technician" && form.services.length === 0)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                  {editingId ? <UserRound size={17} /> : <Plus size={18} />}
                  {isSaving ? "Saving..." : editingId ? "Save Changes" : isManager ? "Add Technician" : "Add Staff"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#102a33]">{value}</p>
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-black">Team roster</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-2">Sr. No.</th>
                <th className="px-4 py-2">Staff</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Manager</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Pincode</th>
                <th className="px-5 py-3">Status</th>
                <th className="sticky left-0 z-20 bg-slate-50 px-5 py-3 shadow-[4px_0_8px_-6px_rgba(15,23,42,0.4)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member,i) => (
                <tr key={member.id ?? member.name} className="border-t border-slate-100">
                  <td className="px-5 py-4">{i + 1}</td>
                  <td className="px-4 py-2 font-bold text-[#102a33]">{member.name}</td>
                  <td className="px-5 py-4">{member.email ?? "—"}</td>
                  <td className="px-5 py-4">{member.role}</td>
                  <td className="px-5 py-4">{member.manager ?? "—"}</td>
                  <td className="px-5 py-4">{member.location}</td>
                  <td className="px-5 py-4">{member.pincode ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${member.status === "Active" ? "bg-emerald-100 text-emerald-700" : member.status === "On site" ? "bg-blue-100 text-blue-700" : member.status === "On route" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="sticky left-0 z-10 bg-white px-5 py-4 shadow-[4px_0_8px_-6px_rgba(15,23,42,0.4)]">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setConfirmation({ action: "edit", member })} disabled={isSaving || deletingId !== null} aria-label={`Edit ${member.name}`} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
                        <Pencil size={14} aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => setConfirmation({ action: "delete", member })} disabled={isSaving || deletingId === member.id} aria-label={`Delete ${member.name}`} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50">
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {confirmation && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onClick={() => setConfirmation(null)}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="staff-confirmation-title"
            aria-describedby="staff-confirmation-message"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`grid h-12 w-12 place-items-center rounded-full ${confirmation.action === "delete" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
              <CircleHelp size={25} />
            </div>
            <h3 id="staff-confirmation-title" className="mt-4 text-lg font-black text-slate-900">
              {confirmation.action === "edit" ? "Edit staff details?" : "Delete staff member?"}
            </h3>
            <p id="staff-confirmation-message" className="mt-2 text-sm leading-6 text-slate-600">
              {confirmation.action === "edit"
                ? `Do you want to edit ${confirmation.member.name}'s staff details?`
                : `Are you sure you want to delete ${confirmation.member.name}? This staff member will be removed from the roster.`}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmStaffAction()}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white ${confirmation.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-700 hover:bg-emerald-800"}`}
              >
                Yes, {confirmation.action === "edit" ? "Edit" : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
