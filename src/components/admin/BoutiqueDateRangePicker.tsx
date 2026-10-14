"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

interface BoutiqueDateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  onClear: () => void;
}

export function BoutiqueDateRangePicker({
  startDate,
  endDate,
  onChange,
  onClear,
}: BoutiqueDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize calendar view to startDate's month or current month
  const initialDate = startDate ? new Date(startDate) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-indexed

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Month metadata
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString(
    "en-US",
    { month: "long" }
  );

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Helper to format Date into "YYYY-MM-DD"
  const formatDateStr = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const handleDayClick = (day: number) => {
    const clickedStr = formatDateStr(currentYear, currentMonth, day);

    // If no start date, or both start & end exist: reset and set start
    if (!startDate || (startDate && endDate)) {
      onChange(clickedStr, "");
      return;
    }

    // If start date exists but no end date:
    if (startDate && !endDate) {
      if (clickedStr < startDate) {
        onChange(clickedStr, startDate);
      } else {
        onChange(startDate, clickedStr);
      }
    }
  };

  const weekDayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 bg-[#FAF7F5] border border-[#EAE3DE] hover:border-[#D4A373] text-[#240610] text-xs font-medium rounded-xl px-3 py-2 cursor-pointer shadow-2xs transition-colors"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#4A1525]" />
          <span>
            {startDate && endDate
              ? `${startDate} → ${endDate}`
              : startDate
              ? `From: ${startDate}`
              : "Select Custom Range"}
          </span>
        </button>

        {(startDate || endDate) && (
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Clear Range"
            aria-label="Clear date range"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-40 bg-[#FAF7F5] border border-[#EAE3DE] shadow-xl rounded-2xl p-4 w-[300px] sm:w-[320px] text-[#240610] animate-in fade-in zoom-in-95 duration-150">
          {/* Header: Month/Year & Champagne Arrows */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EAE3DE]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#D4A373] hover:text-[#4A1525] hover:bg-[#D4A373]/15 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-serif text-sm font-semibold text-[#240610] tracking-wide">
              {monthName} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#D4A373] hover:text-[#4A1525] hover:bg-[#D4A373]/15 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDayLabels.map((wd) => (
              <span
                key={wd}
                className="text-[11px] font-semibold text-[#7A6268] py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty padding before day 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateStr(currentYear, currentMonth, day);

              const isStart = startDate === dateStr;
              const isEnd = endDate === dateStr;
              const isInRange =
                startDate &&
                endDate &&
                dateStr > startDate &&
                dateStr < endDate;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`h-8 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                    isStart || isEnd
                      ? "bg-[#4A1525] text-white font-bold shadow-xs scale-105"
                      : isInRange
                      ? "bg-[#4A1525]/15 text-[#4A1525] font-semibold"
                      : "text-zinc-700 hover:bg-white hover:text-[#4A1525] hover:shadow-2xs"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Info & Done Button */}
          <div className="mt-3 pt-2.5 border-t border-[#EAE3DE] flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">
              {!startDate
                ? "Pick start date"
                : !endDate
                ? "Pick end date"
                : "Range selected"}
            </span>

            <div className="flex items-center gap-1.5">
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={onClear}
                  className="px-2 py-1 text-zinc-500 hover:text-rose-600 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 rounded-lg bg-[#4A1525] text-white hover:bg-[#3B0E1B] font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
