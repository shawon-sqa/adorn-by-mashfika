"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Download,
  X,
  Package,
  Edit2,
  CheckCircle2,
} from "lucide-react";
import { getAdminOrders, AdminOrderRecord } from "@/lib/data/adminOrders";
import { fetchSupabaseOrders } from "@/lib/data/supabaseOrders";
import { getAdminProducts } from "@/lib/data/adminProducts";
import { fetchSupabaseProducts } from "@/lib/data/supabaseProducts";
import { Product } from "@/lib/types/product";
import { getAbandonedCarts, AbandonedCartLead } from "@/lib/data/abandonedCarts";
import { AbandonedCartSection } from "@/components/admin/AbandonedCartSection";
import { AdminAnalyticsChart } from "@/components/admin/AdminAnalyticsChart";
import { formatPrice } from "@/lib/utils/formatters";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartLead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      const sbOrders = await fetchSupabaseOrders();
      if (sbOrders.length > 0) {
        setOrders(sbOrders);
      } else {
        setOrders(getAdminOrders());
      }
      const sbProducts = await fetchSupabaseProducts();
      const loadedProducts = sbProducts.length > 0 ? sbProducts : getAdminProducts();
      setProducts(loadedProducts);
      setProductsCount(loadedProducts.length);
      setAbandonedCarts(getAbandonedCarts());
    }
    loadData();
  }, []);

  const lowStockProducts = products.filter((p) => (p.stockCount ?? 0) < 10);
  const lowStockCount = lowStockProducts.length;

  const totalRevenue = orders.reduce((sum, ord) => sum + ord.pricing.grandTotal, 0);
  const pendingOrders = orders.filter((ord) => ord.orderStatus === "pending").length;
  const recentOrders = orders.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Order ID,Date,Customer,Phone,Total,Payment,Status"].concat(
        orders.map(
          (o) =>
            `${o.orderId},${new Date(o.createdAt).toLocaleDateString()},${o.customer.fullName},${o.customer.phone},${o.pricing.grandTotal},${o.payment.method},${o.orderStatus}`
        )
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `adorn_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
            Store Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Real-time business performance for Adorn by Mashfika.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-charcoal text-xs font-semibold hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            Export Orders (CSV)
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid - Responsive Stacking: 1-col mobile, 2-col tablet, 4-col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-brand-charcoal">
              {formatPrice(totalRevenue)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            ↑ 14.8% from last month
          </p>
        </div>

        {/* Total Orders - Interactive Metric Card */}
        <Link
          href="/admin/orders"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-border/80 shadow-2xs hover:border-[#4A1525]/40 hover:shadow-md transition-all cursor-pointer group block"
          title="View All Orders"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider group-hover:text-brand-primary transition-colors">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-full bg-brand-blush text-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-brand-charcoal">
              {orders.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Across all zones • Click to view</p>
        </Link>

        {/* Pending Orders - Interactive Metric Card */}
        <Link
          href="/admin/orders?status=pending"
          className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-border/80 shadow-2xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group block"
          title="View Pending Orders"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              Pending Verification
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-700">
              {pendingOrders}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 mt-1 font-medium">
            Requires staff dispatch • Click to filter
          </p>
        </Link>

        {/* Low Stock Warning */}
        <div
          onClick={() => setShowLowStockModal(true)}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-brand-border/80 shadow-2xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group relative"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setShowLowStockModal(true);
            }
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600">
              {lowStockCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 group-hover:text-rose-700 transition-colors">
              View Items
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {lowStockCount > 0 ? "< 10 units in stock" : "All items well stocked"} • {productsCount} catalog items
          </p>
        </div>
      </div>

      {/* Interactive Sales & Order Analytics Chart */}
      <AdminAnalyticsChart orders={orders} />

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-brand-border/80 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-brand-border/60 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg text-brand-charcoal">Recent Customer Orders</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Latest transactions placed on the boutique storefront
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
          >
            View all orders
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-zinc-500 uppercase tracking-wider border-b border-brand-border/60">
              <tr>
                <th className="py-3 px-6 font-semibold">Order ID</th>
                <th className="py-3 px-6 font-semibold">Customer</th>
                <th className="py-3 px-6 font-semibold">Items</th>
                <th className="py-3 px-6 font-semibold">Payment</th>
                <th className="py-3 px-6 font-semibold">Total Amount</th>
                <th className="py-3 px-6 font-semibold">Status</th>
                <th className="py-3 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50 text-zinc-700">
              {recentOrders.map((ord) => (
                <tr key={ord.orderId} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-brand-charcoal">
                    {ord.orderId}
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-brand-charcoal">{ord.customer.fullName}</p>
                    <p className="text-[11px] text-zinc-400">{ord.customer.phone}</p>
                  </td>
                  <td className="py-4 px-6">{ord.items.length} item(s)</td>
                  <td className="py-4 px-6">
                    <span className="uppercase text-[11px] font-medium">
                      {ord.payment.method === "cod" ? "COD" : "bKash"}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-brand-charcoal">
                    {formatPrice(ord.pricing.grandTotal)}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusBadge(
                        ord.orderStatus
                      )}`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/admin/orders/${ord.orderId}`}
                      className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Customer Carts & Follow-Ups Section */}
      <AbandonedCartSection initialCarts={abandonedCarts} />

      {/* Low Stock Inventory Breakdown Modal */}
      {showLowStockModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowLowStockModal(false)}
        >
          <div
            className="bg-white rounded-3xl border border-brand-border/90 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-border/60 flex items-center justify-between bg-[#FAF8F5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100/80 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-brand-charcoal">
                    Low Stock Inventory Alert
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Products requiring replenishment (stock &lt; 10 units)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLowStockModal(false)}
                className="p-2 text-zinc-400 hover:text-brand-charcoal hover:bg-zinc-200/50 rounded-xl transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Product Breakdown */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-brand-border/40">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-base text-brand-charcoal">
                    All Inventory Healthy
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    There are currently no products with less than 10 units in stock.
                  </p>
                </div>
              ) : (
                lowStockProducts.map((p) => {
                  const isOut = (p.stockCount ?? 0) <= 0 || !p.inStock;
                  return (
                    <div
                      key={p.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 rounded-xl px-2 -mx-2 transition-colors"
                    >
                      {/* Thumbnail & Product Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${p.gradient || "from-stone-100 to-amber-50"} border border-brand-border/60 flex-shrink-0 flex items-center justify-center overflow-hidden relative shadow-2xs`}
                        >
                          {p.images && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-medium text-xs sm:text-sm text-brand-charcoal truncate">
                            {p.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="uppercase text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                              {p.category}
                            </span>
                            <span className="text-xs font-bold text-brand-charcoal">
                              {formatPrice(p.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Badge & Edit Link */}
                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            0 units left (Out of Stock)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {p.stockCount} units left
                          </span>
                        )}

                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          onClick={() => setShowLowStockModal(false)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-hover transition-colors shadow-2xs"
                          title="Edit Product Stock"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-brand-border/60 bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                href="/admin/products"
                onClick={() => setShowLowStockModal(false)}
                className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover hover:underline flex items-center gap-1"
              >
                Go to Full Products Catalog
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setShowLowStockModal(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl border border-brand-border bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
