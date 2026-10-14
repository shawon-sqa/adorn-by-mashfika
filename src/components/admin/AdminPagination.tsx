"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  currentPage,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Determine slice indices for display
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="px-6 py-4 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#FAF7F5]/50">
      {/* Left indicator */}
      <span className="text-zinc-500 font-medium">
        Showing <strong className="text-brand-charcoal">{startItem}</strong> to{" "}
        <strong className="text-brand-charcoal">{endItem}</strong> of{" "}
        <strong className="text-brand-charcoal">{totalItems}</strong> entries
      </span>

      {/* Right controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EAE3DE] bg-white text-zinc-700 hover:bg-[#FAF7F5] hover:text-[#4A1525] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page Number Pills */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-zinc-400 select-none"
                  >
                    …
                  </span>
                );
              }

              const pageNum = p as number;
              const isActive = currentPage === pageNum;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center cursor-pointer ${
                    isActive
                      ? "bg-[#4A1525] text-white shadow-xs"
                      : "bg-white text-zinc-700 hover:bg-[#FAF7F5] hover:text-[#4A1525] border border-[#EAE3DE]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#EAE3DE] bg-white text-zinc-700 hover:bg-[#FAF7F5] hover:text-[#4A1525] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
