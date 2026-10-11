import { Suspense } from "react";
import { AdminLoginClient } from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1C1A1A] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
