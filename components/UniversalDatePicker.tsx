'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar, ChevronDown } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { formatDate } from '@/lib/date-utils';
import NepaliCalendarInput from '@/utils/nepali-date/NepaliCalendarInput';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export default function UniversalDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  disabled = false,
  label
}: DatePickerProps) {
  const { dateFormat } = useSettings();
  const [open, setOpen] = useState(false);

  const handleDateChange = (date: Date) => {
    onChange?.(date);
    setOpen(false);
  };

  const displayValue = value ? formatDate(value, { format: dateFormat }) : "";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label>{label}</Label>}
      
      {dateFormat === 'nepali' || dateFormat === 'both' ? (
        // Use Nepali Calendar for nepali/both formats
        <NepaliCalendarInput
          value={value}
          onChange={handleDateChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        // Use standard HTML5 date input for English format
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              disabled={disabled}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {displayValue || placeholder}
              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <Input
                type="date"
                value={value ? value.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleDateChange(new Date(e.target.value));
                  }
                }}
                className="w-full"
              />
            </div>
          </PopoverContent>
        </Popover>
      )}
      
      {dateFormat === 'both' && value && (
        <div className="text-xs text-muted-foreground">
          English: {formatDate(value, { format: 'english' })}
        </div>
      )}
    </div>
  );
}
