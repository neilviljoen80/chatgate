import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
