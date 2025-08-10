// components/NepaliCalendar.jsx
import React, { useState, useEffect, useRef } from 'react';
import NepaliDate from './NepaliDate';
import { NEPALI_DATE_MAP, START_YEAR } from './config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Nepali month names
const nepaliMonths = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

interface NepaliCalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const NepaliCalendarInput = ({ 
  value, 
  onChange, 
  placeholder = "Select Nepali date...", 
  className,
  disabled = false 
}: NepaliCalendarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // console.log(value, 'VALUE');
  const [selectedDate, setSelectedDate] = useState<NepaliDate | null>(
    value ? new NepaliDate(value) : null
  );
  const [currentView, setCurrentView] = useState(new NepaliDate());
  const [calendarGrid, setCalendarGrid] = useState<(number | null)[][]>([]);
  const [selectedYear, setSelectedYear] = useState(currentView.getYear());
  const [selectedMonth, setSelectedMonth] = useState(currentView.getMonth());

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      console.log(value, 'VALUE');
      console.log(typeof value, 'TYPE OF VALUE');
      const nepaliDate = new NepaliDate(value);
      console.log(nepaliDate, 'NEPALI DATE'); 
      setSelectedDate(nepaliDate);
      setCurrentView(nepaliDate);
      setSelectedYear(nepaliDate.getYear());
      setSelectedMonth(nepaliDate.getMonth());
    }
  }, [value]);

  useEffect(() => {
    generateCalendar(currentView);
  }, [currentView]);

  // Generate available years (2000-2088 based on NEPALI_DATE_MAP)
  const availableYears = Array.from({ length: 89 }, (_, i) => START_YEAR + i);

  const generateCalendar = (date: NepaliDate) => {
    const year = date.getYear();
    const month = date.getMonth(); // 0-indexed
    
    // Get days in month from the Nepali date map
    const daysInMonth = getDaysInBsMonth(year, month + 1); // function expects 1-indexed
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

  // Helper function to get days in a Nepali month using the actual mapping
  const getDaysInBsMonth = (year: number, month: number): number => {
    const yearIndex = year - START_YEAR;
    if (yearIndex >= 0 && yearIndex < NEPALI_DATE_MAP.length) {
      return NEPALI_DATE_MAP[yearIndex][month];
    }
    // Fallback to a reasonable default if year is out of range
    const defaultMonths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30];
    return defaultMonths[month - 1] || 30;
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    const newDate = new NepaliDate(newYear, selectedMonth, 1);
    setCurrentView(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newMonth = parseInt(month);
    setSelectedMonth(newMonth);
    const newDate = new NepaliDate(selectedYear, newMonth, 1);
    setCurrentView(newDate);
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
    setCurrentView(next);
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
    setCurrentView(prev);
  };

  const handleDateClick = (day: number | null) => {
    if (!day) return;
    
    const clickedDate = new NepaliDate(selectedYear, selectedMonth, day);
    setSelectedDate(clickedDate);
    
    // Convert to English date and call onChange
    const englishDate = clickedDate.getEnglishDate();
    onChange?.(englishDate);
    
    // Close the popover
    setIsOpen(false);
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return '';
    return `${selectedDate.format('YYYY-MM-DD')} BS`;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new NepaliDate();
    return today.getYear() === selectedYear && 
           today.getMonth() === selectedMonth && 
           today.getDate() === day;
  };

  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    return selectedDate.getYear() === selectedYear && 
           selectedDate.getMonth() === selectedMonth && 
           selectedDate.getDate() === day;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start text-left font-normal h-9",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          <span className="text-sm">
            {selectedDate ? formatDisplayValue() : placeholder}
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
            {calendarGrid.map((week, weekIdx) => (
              week.map((day, dayIdx) => (
                <Button
                  key={`${weekIdx}-${dayIdx}-${day}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "h-6 w-6 p-0 text-xs",
                    isToday(day) && "bg-blue-100 text-blue-700 font-bold",
                    isSelected(day) && "bg-blue-600 text-white hover:bg-blue-700",
                    !day && "invisible",
                    day && !isSelected(day) && !isToday(day) && "hover:bg-gray-100"
                  )}
                  disabled={!day}
                >
                  {day || ''}
                </Button>
              ))
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NepaliCalendarInput;
