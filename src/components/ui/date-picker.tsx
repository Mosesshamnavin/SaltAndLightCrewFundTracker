"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    try {
      return parseISO(value)
    } catch {
      return undefined
    }
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Format as YYYY-MM-DD for database consistency
      const formatted = format(date, "yyyy-MM-dd")
      onChange(formatted)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-slate-50 border-slate-200 rounded-xl hover:bg-slate-100/80 hover:text-slate-900 transition h-10 px-3.5 text-xs sm:text-sm",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-500 shrink-0" />
          {selectedDate ? (
            <span className="font-medium text-slate-800">
              {format(selectedDate, "dd MMM yyyy")}
            </span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-200 bg-white z-[60]" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  )
}
