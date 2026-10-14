"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Eye,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  DollarSign,
  Package,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  getAdminOrders,
  deleteAdminOrder,
  AdminOrderRecord,
  OrderStatus,
} from "@/lib/data/adminOrders";
import {
  fetchSupabaseOrders,
  deleteSupabaseOrder,
} from "@/lib/data/supabaseOrders";
import {
  getAbandonedCarts,
  AbandonedCartLead,
} from "@/lib/data/abandonedCarts";
import { AbandonedCartSection } from "@/components/admin/AbandonedCartSection";
import { formatPrice } from "@/lib/utils/formatters";
import { BoutiqueDateRangePicker } from "@/components/admin/BoutiqueDateRangePicker";
import { AdminPagination } from "@/components/admin/AdminPagination";

type DatePreset = "all" | "today" | "week" | "month" | "year" | "custom";

export default function AdminOrdersListPage() {
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartLead[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  // Delete Confirmation Modal State
  const [orderToDelete, setOrderToDelete] = useState<AdminOrderRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Read URL search parameter '?status=pending' to auto-activate tab
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const statusParam = params.get("status");
      if (statusParam) {
        setSelectedStatus(statusParam.toLowerCase());
      }
    }
  }, []);

  // Close custom date dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadOrders() {
      const sbOrders = await fetchSupabaseOrders();
      if (sbOrders.length > 0) {
        setOrders(sbOrders);
      } else {
        setOrders(getAdminOrders());
      }
      setAbandonedCarts(getAbandonedCarts());
    }
    loadOrders();
  }, []);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const statuses = [
    { label: "All Orders", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday or standard start
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    return orders.filter((ord) => {
      // 1. Status Filter
      const matchesStatus =
        selectedStatus === "all" ? true : ord.orderStatus === selectedStatus;

      // 2. Search Filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q
        ? ord.orderId.toLowerCase().includes(q) ||
          ord.customer.fullName.toLowerCase().includes(q) ||
          ord.customer.phone.includes(q)
        : true;

      // 3. Date Filter
      let matchesDate = true;
      const orderDate = new Date(ord.createdAt);

      if (datePreset === "today") {
        matchesDate = orderDate >= startOfToday;
      } else if (datePreset === "week") {
        matchesDate = orderDate >= startOfWeek;
      } else if (datePreset === "month") {
        matchesDate = orderDate >= startOfMonth;
      } else if (datePreset === "year") {
        matchesDate = orderDate >= startOfYear;
      } else if (datePreset === "custom") {
        if (customStartDate) {
          const s = new Date(customStartDate);
          s.setHours(0, 0, 0, 0);
          if (orderDate < s) matchesDate = false;
        }
        if (customEndDate) {
          const e = new Date(customEndDate);
          e.setHours(23, 59, 59, 999);
          if (orderDate > e) matchesDate = false;
        }
      }

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [
    orders,
    selectedStatus,
    searchQuery,
    datePreset,
    customStartDate,
    customEndDate,
  ]);

  // Reset to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery, datePreset, customStartDate, customEndDate]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * 10;
    return filteredOrders.slice(start, start + 10);
  }, [filteredOrders, currentPage]);

  const totalFilteredRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.pricing.grandTotal, 0);
  }, [filteredOrders]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "draft":
        return "bg-zinc-100 text-zinc-700 border-zinc-300 font-semibold";
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

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    const targetOrderId = orderToDelete.orderId;
    const targetId = (orderToDelete as any).id;
    setIsDeleting(true);

    try {
      // 1. Delete in Supabase cloud
      await deleteSupabaseOrder(targetOrderId);

      // 2. Also remove from local fallback storage if present
      deleteAdminOrder(targetOrderId);

      // 3. Optimistically filter active orders state without setting empty array:
      setOrders((prev) =>
        prev.filter(
          (order) =>
            order.orderId !== targetOrderId &&
            (order as any).id !== targetOrderId &&
            (!targetId || (order as any).id !== targetId)
        )
      );

      triggerToast(`Order #${targetOrderId} was permanently deleted.`);
      setOrderToDelete(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
      // Keep UI updated optimistically
      setOrders((prev) =>
        prev.filter(
          (order) =>
            order.orderId !== targetOrderId &&
            (order as any).id !== targetOrderId
        )
      );
      triggerToast(`Order #${targetOrderId} removed.`);
      setOrderToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-brand-charcoal text-white text-xs shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header & Metrics Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-charcoal">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Review, fulfill, and track incoming boutique orders.
          </p>
        </div>

        {/* Filtered Summary Pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-brand-border/80 shadow-2xs flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-primary" />
            <span className="text-xs text-zinc-500">Orders:</span>
            <span className="text-xs font-bold text-brand-charcoal">
              {filteredOrders.length}
            </span>
          </div>

          <div className="px-4 py-2 rounded-xl bg-white border border-brand-border/80 shadow-2xs flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-zinc-500">Revenue:</span>
            <span className="text-xs font-bold text-emerald-700">
              {formatPrice(totalFilteredRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Date Search Toolbar */}
      <div className="bg-white rounded-2xl border border-brand-border/80 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Row 1: Status Filter Buttons & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
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

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Customer, Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-border text-xs focus:outline-none focus:border-brand-primary bg-zinc-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Advanced Date Filter Toolbar */}
        <div className="pt-3 border-t border-brand-border/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <span className="font-semibold text-zinc-600 uppercase tracking-wider text-[11px]">
              Date Period:
            </span>
            {/* Custom Boutique Date Period Dropdown */}
            <div className="relative inline-block" ref={dateDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
                className="inline-flex items-center justify-between gap-2.5 bg-[#FAF7F5] border border-[#EAE3DE] text-[#240610] text-xs font-medium rounded-xl px-3 py-2 hover:border-[#D4A373] transition-colors cursor-pointer shadow-2xs min-w-[130px]"
                aria-haspopup="listbox"
                aria-expanded={isDateDropdownOpen}
              >
                <span>
                  {datePreset === "all"
                    ? "All Time"
                    : datePreset === "today"
                    ? "Today"
                    : datePreset === "week"
                    ? "This Week"
                    : datePreset === "month"
                    ? "This Month"
                    : datePreset === "year"
                    ? "This Year"
                    : "Custom Range"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#554348] transition-transform duration-200 ${
                    isDateDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDateDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute left-0 mt-1.5 w-48 bg-white border border-[#EAE3DE] shadow-lg rounded-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150"
                >
                  {[
                    { label: "All Time", value: "all" as DatePreset },
                    { label: "Today", value: "today" as DatePreset },
                    { label: "This Week", value: "week" as DatePreset },
                    { label: "This Month", value: "month" as DatePreset },
                    { label: "This Year", value: "year" as DatePreset },
                    { label: "Custom Range", value: "custom" as DatePreset },
                  ].map((opt) => {
                    const isSelected = datePreset === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setDatePreset(opt.value);
                          setIsDateDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#FAF7F5] text-[#4A1525] font-semibold"
                            : "text-[#240610] hover:bg-[#FAF7F5] font-normal"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A373]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Custom Date Range Picker */}
          {datePreset === "custom" && (
            <BoutiqueDateRangePicker
              startDate={customStartDate}
              endDate={customEndDate}
              onChange={(start, end) => {
                setCustomStartDate(start);
                setCustomEndDate(end);
              }}
              onClear={() => {
                setCustomStartDate("");
                setCustomEndDate("");
              }}
            />
          )}

          <div className="text-zinc-400 text-[11px] ml-auto">
            Showing {filteredOrders.length} of {orders.length} total orders
          </div>
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
                paginatedOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-brand-charcoal">
                      {ord.orderId}
                    </td>
                    <td className="py-4 px-6 text-zinc-500 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString("en-BD", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
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
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link
                          href={`/admin/orders/${ord.orderId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-blush hover:bg-brand-primary text-brand-primary hover:text-white transition-colors text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(ord)}
                          title="Delete Order"
                          className="p-1.5 rounded-lg border border-brand-border text-zinc-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Boutique Pagination Component */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Abandoned Carts / Customer Follow-Up Section */}
      <AbandonedCartSection initialCarts={abandonedCarts} />

      {/* Luxury Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-brand-border/80 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl text-brand-charcoal">
                Delete Order #{orderToDelete.orderId}?
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                This will permanently remove the order record for{" "}
                <strong className="text-brand-charcoal">
                  {orderToDelete.customer.fullName}
                </strong>{" "}
                ({formatPrice(orderToDelete.pricing.grandTotal)}) from boutique order records
                and dispatch queues. This action cannot be reversed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-brand-border/60 text-xs text-zinc-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-400">Customer Phone:</span>
                <span className="font-mono">{orderToDelete.customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Order Items:</span>
                <span>{orderToDelete.items.length} item(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status:</span>
                <span className="uppercase font-semibold text-brand-charcoal">
                  {orderToDelete.orderStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl border border-brand-border bg-white text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

