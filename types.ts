export interface CalendarEvent {
  id: string;
  date: string; // Start date 'YYYY-MM-DD'
  endDate?: string; // Optional end date 'YYYY-MM-DD' for multi-day events
  title: string;
  time: string; // 'HH:MM', empty if isAllDay is true
  color: string; // Tailwind bg color class e.g., 'bg-blue-500'
  isAllDay: boolean;
  isHoliday?: boolean;
}
