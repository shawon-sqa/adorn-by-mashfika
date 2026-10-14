import { Suspense } from "react";
import { OrderSuccessClient } from "./OrderSuccessClient";

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

async function OrderSuccessContent({ params }: OrderSuccessPageProps) {
  const { orderId } = await params;
  return <OrderSuccessClient orderId={orderId} />;
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F5]">
          <div className="w-8 h-8 border-4 border-[#4A1525] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderSuccessContent params={params} />
    </Suspense>
  );
}
