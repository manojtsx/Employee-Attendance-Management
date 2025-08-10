// components/NepaliCalendar.jsx
import React, { useState, useEffect } from 'react';
import NepaliDate from './NepaliDate'; // adjust path as needed
import { NEPALI_DATE_MAP, START_YEAR } from './config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Nepali month names
const nepaliMonths = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

const NepaliCalendarUI = () => {
  const [bsDate, setBsDate] = useState(new NepaliDate());
  const [calendarGrid, setCalendarGrid] = useState<(number | null)[][]>([]);
  const [selectedYear, setSelectedYear] = useState(bsDate.getYear());
  const [selectedMonth, setSelectedMonth] = useState(bsDate.getMonth());

  useEffect(() => {
    generateCalendar(bsDate);
  }, [bsDate]);

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
    const adDate = clickedDate.getEnglishDate();
    alert(`You clicked: BS ${clickedDate.format('YYYY-MM-DD')} → AD ${adDate.toDateString()}`);
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white">
      {/* Year and Month Selection */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year} BS
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Month</label>
          <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {nepaliMonths.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={goToPrevMonth}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
        >
          ◀
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {nepaliMonths[selectedMonth]} {selectedYear}
        </h2>
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded hover:bg-gray-100 transition-colors"
        >
          ▶
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-gray-600 mb-2">
        {days.map((d) => (
          <div key={d} className="p-2 text-sm">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarGrid.flat().map((day, idx) => (
          <div
            key={idx}
            onClick={() => handleDateClick(day)}
            className={`p-2 rounded cursor-pointer text-sm transition-colors ${
              day 
                ? 'bg-gray-50 hover:bg-blue-100 hover:text-blue-700 border border-gray-200' 
                : 'text-gray-300'
            }`}
          >
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NepaliCalendarUI;
