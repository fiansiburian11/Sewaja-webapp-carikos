import DashboardLayout from "@/components/navbardashboard";

export default function DashboardPage({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div>{children}</div>
    </DashboardLayout>
  );
}
