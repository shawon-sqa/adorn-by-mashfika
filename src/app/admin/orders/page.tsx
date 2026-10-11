"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Eye } from "lucide-react";
import {
  getAdminOrders,
  AdminOrderRecord,
  OrderStatus,
} from "@/lib/data/adminOrders";
import { formatPrice } from "@/lib/utils/formatters";

export default function AdminOrdersListPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setOrders(getAdminOrders());
  }, []);

  const statuses = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus =
        selectedStatus === "all" ? true : ord.orderStatus === selectedStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q
        ? ord.orderId.toLowerCase().includes(q) ||
          ord.customer.fullName.toLowerCase().includes(q) ||
          ord.customer.phone.includes(q)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  const getStatusBadge = (status: OrderStatus) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
          Order Management
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Review, fulfill, and track incoming boutique orders.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-brand-border/80 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === s.value
                  ? "bg-brand-primary text-white shadow-2xs"
                  : "bg-brand-ivory text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-zinc-50/50"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-brand-border/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-zinc-500 uppercase tracking-wider border-b border-brand-border/60">
              <tr>
                <th className="py-3 px-6 font-semibold">Order Reference</th>
                <th className="py-3 px-6 font-semibold">Date</th>
                <th className="py-3 px-6 font-semibold">Customer & Phone</th>
                <th className="py-3 px-6 font-semibold">Zone</th>
                <th className="py-3 px-6 font-semibold">Total Amount</th>
                <th className="py-3 px-6 font-semibold">Payment Mode</th>
                <th className="py-3 px-6 font-semibold">Fulfillment Status</th>
                <th className="py-3 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50 text-zinc-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-brand-charcoal">
                      {ord.orderId}
                    </td>
                    <td className="py-4 px-6 text-zinc-500 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-brand-charcoal">{ord.customer.fullName}</p>
                      <p className="text-[11px] text-zinc-400">{ord.customer.phone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="capitalize text-[11px]">
                        {ord.customer.deliveryZone === "inside_dhaka"
                          ? "Inside Dhaka"
                          : "Outside Dhaka"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-charcoal">
                      {formatPrice(ord.pricing.grandTotal)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="uppercase text-[11px] font-semibold text-zinc-600">
                        {ord.payment.method === "cod" ? "COD" : "bKash Manual"}
                      </span>
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-blush hover:bg-brand-primary text-brand-primary hover:text-white transition-colors text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
