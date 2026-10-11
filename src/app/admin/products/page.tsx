"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, AlertTriangle } from "lucide-react";
import { Product } from "@/lib/types/product";
import { getAdminProducts } from "@/lib/data/adminProducts";
import { formatPrice } from "@/lib/utils/formatters";

export default function AdminProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setProducts(getAdminProducts());
  }, []);

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

  return (
    <div className="space-y-6">
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs self-start sm:self-auto"
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
                <th className="py-3 px-6 font-semibold text-right">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50 text-zinc-700">
              {filteredProducts.map((p) => {
                const isLowStock = p.stockCount <= 5;
                const isOutOfStock = p.stockCount === 0 || !p.inStock;

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${p.gradient} border border-brand-border/60 flex-shrink-0 flex items-center justify-center p-1 text-center`}
                      >
                        <span className="font-serif text-[8px] text-zinc-700 italic line-clamp-1">
                          {p.title}
                        </span>
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
                      <Link
                        href={`/shop/${p.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Live Store
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
