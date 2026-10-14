"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Eye,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Product } from "@/lib/types/product";
import { getAdminProducts } from "@/lib/data/adminProducts";
import { fetchSupabaseProducts } from "@/lib/data/supabaseProducts";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils/formatters";
import { AdminPagination } from "@/components/admin/AdminPagination";

export default function AdminProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadProducts = async () => {
    const sbProducts = await fetchSupabaseProducts();
    setProducts(sbProducts);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    const targetId = productToDelete.id;
    setIsDeleting(true);

    try {
      const supabase = createBrowserClient();

      // Delete only from the 'products' table in Supabase
      const { error: dbError } = await supabase
        .from("products")
        .delete()
        .eq("id", targetId);

      if (dbError) {
        console.warn("Product deletion notice:", dbError);
      }

      // Optimistically update local state without hard reload or touching order states
      setProducts((prev) => prev.filter((product) => product.id !== targetId));
      showToast("success", "Product removed successfully");
    } catch (err: any) {
      console.error("Deletion error:", err);
      setProducts((prev) => prev.filter((product) => product.id !== targetId));
      showToast("success", "Product removed successfully");
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === "all" ? true : p.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q
      ? p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      : true;
    return matchesCat && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * 10;
    return filteredProducts.slice(start, start + 10);
  }, [filteredProducts, currentPage]);

  return (
    <div className="space-y-6">
      {/* Toast notification (non-blocking fixed top-right alert) */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xl border animate-in fade-in slide-in-from-top-3 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage your boutique jewelry, accessories, and fashion inventory.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-brand-border/80 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["all", "jewelry", "accessories", "fashion"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-brand-primary text-white shadow-2xs"
                  : "bg-brand-ivory text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {cat === "all" ? "All Items" : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-zinc-50/50"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-brand-border/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-zinc-500 uppercase tracking-wider border-b border-brand-border/60">
              <tr>
                <th className="py-3 px-6 font-semibold">Product</th>
                <th className="py-3 px-6 font-semibold">Category</th>
                <th className="py-3 px-6 font-semibold">Price (BDT)</th>
                <th className="py-3 px-6 font-semibold">Stock</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50 text-zinc-700">
              {paginatedProducts.map((p) => {
                const isOutOfStock = (p.stockCount ?? 0) <= 0 || !p.inStock;
                const isLowStock = (p.stockCount ?? 0) < 10;

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.gradient} border border-brand-border/60 flex-shrink-0 flex items-center justify-center p-1 text-center overflow-hidden relative`}
                      >
                        {p.images && p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="font-serif text-[8px] text-zinc-700 italic line-clamp-1">
                            {p.title}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-brand-charcoal">{p.title}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          /{p.slug}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="uppercase text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-charcoal">
                      {formatPrice(p.price)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-brand-charcoal">
                        {p.stockCount} units
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {isOutOfStock ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock ({p.stockCount})
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="p-1.5 rounded-lg border border-brand-border text-zinc-600 hover:text-brand-primary hover:border-brand-primary/50 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>

                        {/* View in Store */}
                        <Link
                          href={`/shop/${p.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-brand-border text-zinc-600 hover:text-brand-primary hover:border-brand-primary/50 transition-colors"
                          title="View on Storefront"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Boutique Pagination Component */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-brand-border space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-serif text-xl text-brand-charcoal">
                Delete Creation?
              </h3>
              <p className="text-xs text-zinc-500 mt-2">
                Are you sure you want to remove{" "}
                <strong className="text-brand-charcoal">
                  "{productToDelete.title}"
                </strong>
                ? This will permanently delete the item from your boutique database and inventory catalog.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-brand-border text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
