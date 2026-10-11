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
} from "lucide-react";
import { getAdminOrders, AdminOrderRecord } from "@/lib/data/adminOrders";
import { getAdminProducts } from "@/lib/data/adminProducts";
import { formatPrice } from "@/lib/utils/formatters";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [productsCount, setProductsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const loadedOrders = getAdminOrders();
    const loadedProducts = getAdminProducts();
    setOrders(loadedOrders);
    setProductsCount(loadedProducts.length);
    setLowStockCount(loadedProducts.filter((p) => p.stockCount <= 5).length);
  }, []);

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

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-2xs">
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

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-full bg-brand-blush text-brand-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-brand-charcoal">
              {orders.length}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Across all zones</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Pending Verification
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-700">
              {pendingOrders}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 mt-1 font-medium">
            Requires staff dispatch
          </p>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Low Stock Alert
            </span>
            <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-rose-600">
              {lowStockCount}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Out of {productsCount} catalog items
          </p>
        </div>
      </div>

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
    </div>
  );
}
