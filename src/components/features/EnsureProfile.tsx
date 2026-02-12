"use client";

import { useEffect } from "react";

export function EnsureProfile() {
  useEffect(() => {
    fetch("/api/auth/complete-registration", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
