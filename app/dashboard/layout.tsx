import React from "react";

export const metadata = {
  title: "CovenantGuard - Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
