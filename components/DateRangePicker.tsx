'use client';

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

type PresetOption = 'last7' | 'last30' | 'last90' | 'thisMonth' | 'thisQuarter' | 'custom';

export function DateRangePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>('last30');
  const [tempDateRange, setTempDateRange] = useState<DateRange>({ start: null, end: null });
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>({ start: null, end: null });
  const [currentMonth1, setCurrentMonth1] = useState(new Date());
  const [currentMonth2, setCurrentMonth2] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  );

  const presets = [
    { id: 'last7' as PresetOption, label: 'Last 7 Days' },
    { id: 'last30' as PresetOption, label: 'Last 30 Days' },
    { id: 'last90' as PresetOption, label: 'Last 90 Days' },
    { id: 'thisMonth' as PresetOption, label: 'This Month' },
    { id: 'thisQuarter' as PresetOption, label: 'This Quarter' },
    { id: 'custom' as PresetOption, label: 'Custom Range' },
  ];

  const getPresetDates = (preset: PresetOption): DateRange => {
    const today = new Date();
    const start = new Date();
    
    switch (preset) {
      case 'last7':
        start.setDate(today.getDate() - 7);
        return { start, end: today };
      case 'last30':
        start.setDate(today.getDate() - 30);
        return { start, end: today };
      case 'last90':
        start.setDate(today.getDate() - 90);
        return { start, end: today };
      case 'thisMonth':
        return {
          start: new Date(today.getFullYear(), today.getMonth(), 1),
          end: today,
        };
      case 'thisQuarter':
        const quarter = Math.floor(today.getMonth() / 3);
        return {
          start: new Date(today.getFullYear(), quarter * 3, 1),
          end: today,
        };
      default:
        return { start: null, end: null };
    }
  };

  const handlePresetClick = (preset: PresetOption) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const dates = getPresetDates(preset);
      setTempDateRange(dates);
    } else {
      setTempDateRange({ start: null, end: null });
    }
  };

  const handleApply = () => {
    setAppliedDateRange(tempDateRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempDateRange(appliedDateRange);
    setIsOpen(false);
  };

  const formatDisplayDate = () => {
    if (!appliedDateRange.start && !appliedDateRange.end && selectedPreset === 'last30') {
      return 'Last 30 Days';
    }
    if (appliedDateRange.start && appliedDateRange.end) {
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };
      return `${formatDate(appliedDateRange.start)} - ${formatDate(appliedDateRange.end)}`;
    }
    return presets.find(p => p.id === selectedPreset)?.label || 'Select Date Range';
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isInRange = (date: Date | null) => {
    if (!date || !tempDateRange.start || !tempDateRange.end) return false;
    return date >= tempDateRange.start && date <= tempDateRange.end;
  };

  const handleDateClick = (date: Date) => {
    if (!tempDateRange.start || (tempDateRange.start && tempDateRange.end)) {
      setTempDateRange({ start: date, end: null });
      setSelectedPreset('custom');
    } else {
      if (date < tempDateRange.start) {
        setTempDateRange({ start: date, end: tempDateRange.start });
      } else {
        setTempDateRange({ ...tempDateRange, end: date });
      }
    }
  };

  const navigateMonth = (calendar: 1 | 2, direction: 'prev' | 'next') => {
    const offset = direction === 'next' ? 1 : -1;
    if (calendar === 1) {
      const newDate = new Date(currentMonth1.getFullYear(), currentMonth1.getMonth() + offset, 1);
      setCurrentMonth1(newDate);
      // Ensure month2 is always after month1
      if (newDate >= currentMonth2) {
        setCurrentMonth2(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 1));
      }
    } else {
      const newDate = new Date(currentMonth2.getFullYear(), currentMonth2.getMonth() + offset, 1);
      setCurrentMonth2(newDate);
      // Ensure month1 is always before month2
      if (newDate <= currentMonth1) {
        setCurrentMonth1(new Date(newDate.getFullYear(), newDate.getMonth() - 1, 1));
      }
    }
  };

  const renderCalendar = (date: Date, calendarNum: 1 | 2) => {
    const days = getDaysInMonth(date);
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="p-4">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(calendarNum, 'prev')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-900">{monthName}</span>
          <button
            onClick={() => navigateMonth(calendarNum, 'next')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isStart = day && isSameDay(day, tempDateRange.start);
            const isEnd = day && isSameDay(day, tempDateRange.end);
            const inRange = day && isInRange(day);
            const isToday = day && isSameDay(day, new Date());

            return (
              <button
                key={index}
                onClick={() => day && handleDateClick(day)}
                disabled={!day}
                className={`
                  h-8 text-sm rounded-lg transition-all
                  ${!day ? 'invisible' : ''}
                  ${isStart || isEnd
                    ? 'bg-brand text-white font-semibold hover:bg-brand-hover'
                    : inRange
                    ? 'bg-brand-light text-brand hover:bg-brand/15'
                    : isToday
                    ? 'bg-gray-100 text-gray-900 font-medium hover:bg-gray-200'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {day?.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-soft"
      >
        <Calendar className="w-4 h-4 text-gray-500" />
        <span>{formatDisplayDate()}</span>
      </button>

      {/* Date Picker Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-dropdown border border-gray-200/60 overflow-hidden">
            <div className="flex">
              {/* Presets Sidebar */}
              <div className="w-48 border-r border-gray-200 bg-gray-50/50 p-3">
                <div className="space-y-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset.id)}
                      className={`
                        w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${selectedPreset === preset.id
                          ? 'bg-brand text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar Section */}
              <div>
                <div className="flex">
                  {renderCalendar(currentMonth1, 1)}
                  <div className="w-px bg-gray-200" />
                  {renderCalendar(currentMonth2, 2)}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors shadow-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
