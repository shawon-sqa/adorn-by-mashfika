import { Suspense } from "react";
import { EditProductClient } from "./EditProductClient";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

async function EditProductContent({ params }: EditProductPageProps) {
  const { id } = await params;
  return <EditProductClient productId={id} />;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EditProductContent params={params} />
    </Suspense>
  );
}
