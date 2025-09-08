import React from 'react';
import type { CalendarEvent } from '../types';

interface CalendarProps {
  days: Date[];
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
  currentMonth: number;
  isCapturing?: boolean;
}

// A helper function to format a Date object to 'YYYY-MM-DD' respecting the local timezone.
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isEventOnDay = (event: CalendarEvent, day: Date): boolean => {
    const dayStr = toYYYYMMDD(day);
    const startStr = event.date;
    const endStr = event.endDate || event.date;
    return dayStr >= startStr && dayStr <= endStr;
};

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const Calendar: React.FC<CalendarProps> = ({ days, events, onDayClick, currentMonth, isCapturing = false }) => {
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {WEEK_DAYS.map((day) => (
        <div key={day} className="text-center font-semibold text-sm text-gray-600 dark:text-gray-400 py-2">
          {day}
        </div>
      ))}
      {days.map((day, index) => {
        const dayEvents = events
          .filter(event => isEventOnDay(event, day))
          .sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            if (a.isAllDay && b.isAllDay) return a.title.localeCompare(b.title);
            return a.time.localeCompare(b.time);
          });
        const isCurrentMonth = day.getMonth() === currentMonth;
        const dayOfWeek = day.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday is 0, Saturday is 6

        return (
          <div
            key={index}
            onClick={() => onDayClick(day)}
            className={`h-36 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg p-2 cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 ${
              !isCurrentMonth
                ? 'bg-gray-50 dark:bg-gray-800/50'
                : isWeekend
                ? 'bg-slate-50 dark:bg-gray-900/30'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex justify-start">
              <span
                className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${!isCapturing && isToday(day) ? 'bg-blue-600 text-white' : ''} ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}
              >
                {day.getDate()}
              </span>
            </div>
            <div className="mt-1 overflow-y-auto space-y-1 flex-grow">
              {dayEvents.map(event => (
                <div key={event.id} className={`text-xs p-1 rounded-lg text-white ${event.color} shadow-md`}>
                  <p className="font-bold break-words">{event.title}</p>
                  {!event.isAllDay && event.time && <p>{event.time}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Calendar;