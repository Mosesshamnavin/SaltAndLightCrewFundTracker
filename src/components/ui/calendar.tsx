"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2 select-none w-full max-w-[280px]", className)}
      classNames={{
        months: "flex flex-col space-y-3",
        month: "space-y-3",
        month_caption: "flex justify-center items-center h-8 relative font-bold text-sm text-slate-800",
        caption_label: "text-sm font-bold text-slate-800 tracking-tight",
        nav: "flex items-center justify-between absolute inset-x-0 top-0 h-8 pointer-events-none px-1",
        button_previous: "h-7 w-7 bg-white p-0 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 shadow-xs pointer-events-auto hover:bg-slate-100 transition flex items-center justify-center cursor-pointer",
        button_next: "h-7 w-7 bg-white p-0 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 shadow-xs pointer-events-auto hover:bg-slate-100 transition flex items-center justify-center cursor-pointer",
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7 mb-1 text-center",
        weekday: "text-[11px] font-bold text-slate-400 py-1 uppercase text-center",
        weeks: "space-y-1",
        week: "grid grid-cols-7 gap-1 text-center",
        day: "p-0 flex items-center justify-center relative",
        day_button: "h-8 w-8 p-0 text-xs font-semibold text-slate-700 rounded-xl transition hover:bg-teal-50 hover:text-[#0F766E] flex items-center justify-center cursor-pointer",
        selected: "!bg-[#0F766E] !text-white font-bold rounded-xl shadow-md shadow-teal-950/30 hover:!bg-[#115E59]",
        today: "bg-slate-100 text-[#0F766E] font-bold border border-teal-200 rounded-xl",
        outside: "text-slate-300 opacity-40 hover:opacity-70",
        disabled: "text-slate-300 opacity-30 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      } as any}
      components={{
        Chevron: ({ orientation, ...iconProps }: any) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...iconProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...iconProps} />
          ),
      } as any}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
