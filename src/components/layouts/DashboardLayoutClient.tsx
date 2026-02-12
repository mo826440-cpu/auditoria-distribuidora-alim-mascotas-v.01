"use client";

import { useState } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayoutClient({
  children,
  userEmail,
  userName,
  rol,
}: {
  children: React.ReactNode;
  userEmail: string;
  userName?: string;
  rol: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar
        rol={rol}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader userEmail={userEmail} userName={userName} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
