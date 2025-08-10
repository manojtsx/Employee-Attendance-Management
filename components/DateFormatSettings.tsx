'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';
import { Calendar, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/date-utils';

export default function DateFormatSettings() {
  const { dateFormat, setDateFormat, timeFormat, setTimeFormat } = useSettings();
  
  const sampleDate = new Date(); // Current date for preview

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date & Time Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Format Setting */}
        <div className="space-y-3">
          <Label htmlFor="date-format">Date Format</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger id="date-format">
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English Calendar</SelectItem>
              <SelectItem value="nepali">Nepali Calendar</SelectItem>
              <SelectItem value="both">Both (Nepali + English)</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Preview: {formatDate(sampleDate, { format: dateFormat })}
          </div>
        </div>

        {/* Time Format Setting */}
        <div className="space-y-3">
          <Label htmlFor="time-format">Time Format</Label>
          <Select value={timeFormat} onValueChange={setTimeFormat}>
            <SelectTrigger id="time-format">
              <SelectValue placeholder="Select time format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hour (14:30)</SelectItem>
              <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Preview: {formatTime(sampleDate, timeFormat)}
          </div>
        </div>

        {/* Combined Preview */}
        <div className="pt-4 border-t">
          <Label>Combined Preview</Label>
          <div className="mt-2 p-3 bg-muted rounded-md">
            <div className="text-sm space-y-1">
              <div>
                <strong>Date:</strong> {formatDate(sampleDate, { format: dateFormat })}
              </div>
              <div>
                <strong>Date + Time:</strong> {formatDate(sampleDate, { 
                  format: dateFormat, 
                  includeTime: true,
                  timeFormat 
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
