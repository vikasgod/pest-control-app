"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";

export default function AuthRedirectPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/login");
      return;
    }

    const role = (session.user as typeof session.user & { role?: string }).role;
    const isStaff = role === "admin" || role === "manager" || role === "technician";
    router.replace(isStaff ? "/crm" : "/");
  }, [isPending, router, session]);

  return <main className="grid min-h-screen place-items-center">Taking you to your Pestquro account...</main>;
}
