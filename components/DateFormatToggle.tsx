'use client';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { Calendar, Globe, Languages } from 'lucide-react';
import type { DateFormat } from '@/contexts/SettingsContext';

export default function DateFormatToggle() {
  const { dateFormat, setDateFormat } = useSettings();

  const formats: { value: DateFormat; label: string; icon: React.ReactNode }[] = [
    { value: 'english', label: 'English', icon: <Globe className="h-4 w-4" /> },
    { value: 'nepali', label: 'नेपाली', icon: <Calendar className="h-4 w-4" /> },
    { value: 'both', label: 'Both', icon: <Languages className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      {formats.map((format) => (
        <Button
          key={format.value}
          variant={dateFormat === format.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDateFormat(format.value)}
          className="h-8 px-2 text-xs"
        >
          {format.icon}
          <span className="ml-1">{format.label}</span>
        </Button>
      ))}
    </div>
  );
}
