import React, { useState, useEffect, useRef } from 'react';
import NepaliDate from './NepaliDate';
import { NEPALI_DATE_MAP, START_YEAR } from './config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const nepaliMonths = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

interface NepaliCalendarRangeUIProps {
  className?: string;
  minYear?: number;
  maxYear?: number;
  labels?: {
    year?: string;
    month?: string;
    start?: string;
    end?: string;
  };
  onChange?: (range: { start: Date | null; end: Date | null }) => void;
  placeholder?: string;
  disabled?: boolean;
  renderDay?: (props: {
    day: number | null;
    isToday: boolean;
    isInRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
    onClick: () => void;
    disabled: boolean;
  }) => React.ReactNode;
}

const NepaliCalendarRangeUI = ({
  className,
  minYear = START_YEAR,
  maxYear = START_YEAR + NEPALI_DATE_MAP.length - 1,
  labels = {},
  onChange,
  placeholder = "Select date range...",
  disabled = false,
  renderDay,
}: NepaliCalendarRangeUIProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bsDate, setBsDate] = useState(new NepaliDate());
  const [calendarGrid, setCalendarGrid] = useState<(number | null)[][]>([]);
  const [selectedYear, setSelectedYear] = useState(bsDate.getYear());
  const [selectedMonth, setSelectedMonth] = useState(bsDate.getMonth());
  const [rangeStart, setRangeStart] = useState<NepaliDate | null>(null);
  const [rangeEnd, setRangeEnd] = useState<NepaliDate | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateCalendar(bsDate);
  }, [bsDate]);

  const availableYears = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  const generateCalendar = (date: NepaliDate) => {
    const year = date.getYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInBsMonth(year, month + 1);
    const firstDay = new NepaliDate(year, month, 1).getDay();
    const grid: (number | null)[][] = [];
    let week: (number | null)[] = new Array(firstDay).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      grid.push(week);
    }
    setCalendarGrid(grid);
  };

  const getDaysInBsMonth = (year: number, month: number): number => {
    const yearIndex = year - START_YEAR;
    if (yearIndex >= 0 && yearIndex < NEPALI_DATE_MAP.length) {
      return NEPALI_DATE_MAP[yearIndex][month];
    }
    const defaultMonths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30];
    return defaultMonths[month - 1] || 30;
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    const newDate = new NepaliDate(newYear, selectedMonth, 1);
    setBsDate(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newMonth = parseInt(month);
    setSelectedMonth(newMonth);
    const newDate = new NepaliDate(selectedYear, newMonth, 1);
    setBsDate(newDate);
  };

  const goToNextMonth = () => {
    let nextYear = selectedYear;
    let nextMonth = selectedMonth + 1;
    if (nextMonth >= 12) {
      nextMonth = 0;
      nextYear += 1;
    }
    setSelectedYear(nextYear);
    setSelectedMonth(nextMonth);
    const next = new NepaliDate(nextYear, nextMonth, 1);
    setBsDate(next);
  };

  const goToPrevMonth = () => {
    let prevYear = selectedYear;
    let prevMonth = selectedMonth - 1;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }
    setSelectedYear(prevYear);
    setSelectedMonth(prevMonth);
    const prev = new NepaliDate(prevYear, prevMonth, 1);
    setBsDate(prev);
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    const clickedDate = new NepaliDate(selectedYear, selectedMonth, day);
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clickedDate);
      setRangeEnd(null);
      onChange?.({ start: clickedDate.getEnglishDate(), end: null });
    } else if (rangeStart && !rangeEnd) {
      if (clickedDate.getTime() < rangeStart.getTime()) {
        setRangeStart(clickedDate);
        setRangeEnd(rangeStart);
        onChange?.({ start: clickedDate.getEnglishDate(), end: rangeStart.getEnglishDate() });
      } else if (clickedDate.getTime() === rangeStart.getTime()) {
        setRangeStart(clickedDate);
        setRangeEnd(clickedDate);
        onChange?.({ start: clickedDate.getEnglishDate(), end: clickedDate.getEnglishDate() });
      } else {
        setRangeEnd(clickedDate);
        onChange?.({ start: rangeStart.getEnglishDate(), end: clickedDate.getEnglishDate() });
      }
    }
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new NepaliDate();
    return today.getYear() === selectedYear && 
           today.getMonth() === selectedMonth && 
           today.getDate() === day;
  };

  const isInRange = (day: number | null) => {
    if (!day || !rangeStart || !rangeEnd) return false;
    const d = new NepaliDate(selectedYear, selectedMonth, day);
    return d.getTime() >= rangeStart.getTime() && d.getTime() <= rangeEnd.getTime();
  };

  const isRangeStart = (day: number | null) => {
    if (!day || !rangeStart) return false;
    return (
      rangeStart.getYear() === selectedYear &&
      rangeStart.getMonth() === selectedMonth &&
      rangeStart.getDate() === day
    );
  };

  const isRangeEnd = (day: number | null) => {
    if (!day || !rangeEnd) return false;
    return (
      rangeEnd.getYear() === selectedYear &&
      rangeEnd.getMonth() === selectedMonth &&
      rangeEnd.getDate() === day
    );
  };

  const formatDisplayValue = () => {
    if (!rangeStart) return '';
    if (!rangeEnd) return `${rangeStart.format('YYYY-MM-DD')} BS`;
    return `${rangeStart.format('YYYY-MM-DD')} to ${rangeEnd.format('YYYY-MM-DD')} BS`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !rangeStart && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          <span className="text-sm">
            {rangeStart ? formatDisplayValue() : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" ref={popoverRef}>
        <div className="p-2 space-y-2">
          {/* Year and Month Selection */}
          <div className="flex gap-1">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700 mb-1 block">Year</label>
              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-xs">
                      {year} BS
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700 mb-1 block">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {nepaliMonths.map((month, index) => (
                    <SelectItem key={index} value={index.toString()} className="text-xs">
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevMonth}
              className="h-6 w-6 p-0"
            >
              <ChevronLeftIcon className="h-3 w-3" />
            </Button>
            <h3 className="text-sm font-semibold text-gray-800">
              {nepaliMonths[selectedMonth]} {selectedYear}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="h-6 w-6 p-0"
            >
              <ChevronRightIcon className="h-3 w-3" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0.5 text-center font-bold text-gray-600">
            {days.map((d) => (
              <div key={d} className="p-1 text-xs">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {calendarGrid.flat().map((day, idx) => {
              const dayIsToday = isToday(day);
              const dayIsInRange = isInRange(day);
              const dayIsRangeStart = isRangeStart(day);
              const dayIsRangeEnd = isRangeEnd(day);
              const dayDisabled = !day;
              
              if (renderDay) {
                const dayProps = {
                  day,
                  isToday: dayIsToday,
                  isInRange: dayIsInRange,
                  isRangeStart: dayIsRangeStart,
                  isRangeEnd: dayIsRangeEnd,
                  onClick: () => handleDateClick(day),
                  disabled: dayDisabled,
                };
                return renderDay(dayProps);
              }

              return (
                <Button
                  key={idx}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "h-6 w-6 p-0 text-xs",
                    // Today styling
                    dayIsToday && "bg-blue-100 text-blue-700 font-bold",
                    // Range styling
                    dayIsInRange && !dayIsRangeStart && !dayIsRangeEnd && "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700",
                    // Range start styling
                    dayIsRangeStart && "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold",
                    // Range end styling
                    dayIsRangeEnd && "bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold",
                    // Default styling
                    day && !dayIsInRange && !dayIsRangeStart && !dayIsRangeEnd && !dayIsToday && "hover:bg-gray-100",
                    // Disabled styling
                    !day && "invisible"
                  )}
                  disabled={dayDisabled}
                >
                  {day || ''}
                </Button>
              );
            })}
          </div>

          {/* Range Info */}
          <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700">
                  {labels.start || 'Start'}:
                </span>
                <span className="text-xs font-mono text-purple-900 bg-white px-2 py-1 rounded">
                  {rangeStart ? rangeStart.format('YYYY-MM-DD') : 'Not selected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700">
                  {labels.end || 'End'}:
                </span>
                <span className="text-xs font-mono text-blue-900 bg-white px-2 py-1 rounded">
                  {rangeEnd ? rangeEnd.format('YYYY-MM-DD') : 'Not selected'}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            Click dates to select range
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NepaliCalendarRangeUI; 