"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function EnsureProfile() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/complete-registration", { method: "POST", credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          router.refresh();
          return;
        }
        const body = await res.json().catch(() => ({}));
        console.error("[complete-registration]", res.status, body);
      })
      .catch((e) => console.error("[complete-registration]", e));
  }, [router]);
  return null;
}
