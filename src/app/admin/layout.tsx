import { Suspense } from "react";
import { AdminLayoutShell } from "@/components/admin/AdminLayoutShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </Suspense>
  );
}
