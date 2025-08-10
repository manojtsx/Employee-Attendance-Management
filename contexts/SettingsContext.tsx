'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type DateFormat = 'nepali' | 'english' | 'both';

interface SettingsContextType {
  dateFormat: DateFormat;
  setDateFormat: (format: DateFormat) => void;
  timeFormat: '12h' | '24h';
  setTimeFormat: (format: '12h' | '24h') => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [dateFormat, setDateFormatState] = useState<DateFormat>('english');
  const [timeFormat, setTimeFormatState] = useState<'12h' | '24h'>('24h');

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedDateFormat = localStorage.getItem('dateFormat') as DateFormat;
    const savedTimeFormat = localStorage.getItem('timeFormat') as '12h' | '24h';
    
    if (savedDateFormat && ['nepali', 'english', 'both'].includes(savedDateFormat)) {
      setDateFormatState(savedDateFormat);
    }
    
    if (savedTimeFormat && ['12h', '24h'].includes(savedTimeFormat)) {
      setTimeFormatState(savedTimeFormat);
    }
  }, []);

  const setDateFormat = (format: DateFormat) => {
    setDateFormatState(format);
    localStorage.setItem('dateFormat', format);
  };

  const setTimeFormat = (format: '12h' | '24h') => {
    setTimeFormatState(format);
    localStorage.setItem('timeFormat', format);
  };

  return (
    <SettingsContext.Provider
      value={{
        dateFormat,
        setDateFormat,
        timeFormat,
        setTimeFormat,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
