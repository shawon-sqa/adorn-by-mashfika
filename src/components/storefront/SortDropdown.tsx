"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, SlidersHorizontal } from "lucide-react";

export type SortOption = "featured" | "price-asc" | "price-desc";

interface SortDropdownProps {
  value: SortOption;
  onChange: (val: SortOption) => void;
  className?: string;
  showIcon?: boolean;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured / Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function SortDropdown({
  value,
  onChange,
  className = "",
  showIcon = true,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full sm:w-auto border border-[#EAE3DE] bg-[#FAF7F5] text-[#3A2228] px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2.5 hover:border-[#D4A373] hover:text-[#4A1525] focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 transition-all cursor-pointer shadow-2xs select-none"
      >
        <div className="flex items-center gap-2">
          {showIcon && (
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4A373]" />
          )}
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#4A1525]" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-48 bg-white border border-[#EAE3DE] shadow-xl rounded-xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9A7079] border-b border-[#F0EAE5] mb-1">
            Sort Creations
          </div>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left text-xs px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#4A1525]/10 text-[#4A1525] font-semibold"
                    : "text-[#554348] hover:bg-[#FAF7F5] hover:text-[#4A1525]"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#D4A373] stroke-[2.5]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
