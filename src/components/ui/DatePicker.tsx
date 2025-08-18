'use client';

import { useState, useEffect, useRef } from 'react';
import { format, isValid, parse } from 'date-fns';

interface DatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function DatePicker({
  id,
  value,
  onChange,
  className = '',
  placeholder = 'Select a date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? parse(value, 'yyyy-MM-dd', new Date()) : null
  );
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Calculate days in the current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Calculate tomorrow's date for minimum selectable date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Create an array for days in the month
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: '', isCurrentMonth: false });
    }
    
    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isPastOrToday = date < tomorrow;
      
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: selectedDate ? date.toDateString() === selectedDate.toDateString() : false,
        isPastOrToday,
        date
      });
    }
    
    return days;
  };
  
  // Handle month navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Handle year navigation
  const prevYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1));
  };
  
  const nextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1));
  };
  
  // Jump to specific year
  const jumpToYear = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
  };
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    // Calculate tomorrow's date for minimum selectable date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Only allow dates from tomorrow onwards
    if (date >= tomorrow) {
      setSelectedDate(date);
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [datePickerRef]);
  
  // Initialize with the current date when component mounts
  useEffect(() => {
    if (value && isValid(parse(value, 'yyyy-MM-dd', new Date()))) {
      const date = parse(value, 'yyyy-MM-dd', new Date());
      setSelectedDate(date);
      setCurrentMonth(date);
    }
  }, [value]);
  
  return (
    <div className="relative" ref={datePickerRef}>
      {/* Date Input Field */}
      <div className="relative">
        <input
          type="text"
          id={id}
          className={`w-full px-5 py-4 border-[1.5px] shadow-sm rounded-xl bg-background/90 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all border-primary/10 dark:border-primary/20 cursor-pointer ${className}`}
          placeholder={placeholder}
          readOnly
          value={selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
          onClick={() => setIsOpen(!isOpen)}
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/40">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        {/* Hidden input for form submission */}
        <input 
          type="hidden" 
          id={`${id}-hidden`} 
          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} 
        />
      </div>
      
      {/* Date Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Calendar Header with Month Navigation */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              {/* Previous Month Button */}
              <button 
                type="button"
                onClick={prevMonth}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Previous Month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Display Current Month */}
              <div className="font-medium text-sm">{format(currentMonth, 'MMMM')}</div>
              
              {/* Next Month Button */}
              <button 
                type="button"
                onClick={nextMonth}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Next Month"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Year Navigation */}
            <div className="flex items-center space-x-1">
              {/* Previous Year Button */}
              <button 
                type="button"
                onClick={prevYear}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Previous Year"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Year Selector */}
              <select
                value={currentMonth.getFullYear()}
                onChange={(e) => jumpToYear(parseInt(e.target.value))}
                className="bg-transparent text-sm font-medium focus:outline-none focus:ring-0 border-none"
                aria-label="Select Year"
              >
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              {/* Next Year Button */}
              <button 
                type="button"
                onClick={nextYear}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Next Year"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7m-8-14l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 p-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
              <div key={i} className="p-1">{day}</div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 p-2">
            {getDaysInMonth().map((day, i) => (
              <div
                key={i}
                className={`
                  p-2 text-center text-sm rounded-md 
                  ${!day.isCurrentMonth ? 'invisible' : ''}
                  ${day.isPastOrToday ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'cursor-pointer'}
                  ${day.isSelected ? 'bg-primary text-white' : day.isToday ? 'bg-primary/10 text-primary' : day.isPastOrToday ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                `}
                onClick={() => day.isCurrentMonth && day.date && !day.isPastOrToday && handleDateSelect(day.date)}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
