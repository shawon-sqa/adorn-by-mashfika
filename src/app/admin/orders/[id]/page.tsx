import { Suspense } from "react";
import { AdminOrderDetailClient } from "./AdminOrderDetailClient";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

async function AdminOrderDetailContent({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  return <AdminOrderDetailClient orderId={id} />;
}

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminOrderDetailContent params={params} />
    </Suspense>
  );
}
