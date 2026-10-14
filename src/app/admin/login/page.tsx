import { Suspense } from "react";
import { AdminLoginClient } from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#4A1525] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
