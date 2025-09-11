import { useState, useMemo } from 'react';

export const useCalendar = (initialDate: Date, onDateChange: (date: Date) => void, multiMonthCount: number = 3) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const monthName = useMemo(() => currentDate.toLocaleDateString('es-ES', { month: 'long' }), [currentDate]);
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);

  const multiMonthName = useMemo(() => {
    const m1 = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const mEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + multiMonthCount - 1, 1);
    
    const month1Name = m1.toLocaleDateString('es-ES', { month: 'long' });
    const monthEndName = mEnd.toLocaleDateString('es-ES', { month: 'long' });
    const year1 = m1.getFullYear();
    const yearEnd = mEnd.getFullYear();
    
    const yearString = year1 === yearEnd ? year1.toString() : `${year1} - ${yearEnd}`;
    
    return `${month1Name} - ${monthEndName} ${yearString}`;
  }, [currentDate, multiMonthCount]);

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    const calendarDays: Date[] = [];

    // Add padding days from the previous month
    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = firstDayOfWeek; i > 0; i--) {
      calendarDays.push(new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), prevMonthLastDay.getDate() - i + 1));
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }

    // Add padding days from the next month to fill the grid (6 rows * 7 cols = 42 cells)
    const nextMonthFirstDay = new Date(year, month + 1, 1);
    const remainingCells = 42 - calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
        calendarDays.push(new Date(nextMonthFirstDay.getFullYear(), nextMonthFirstDay.getMonth(), i));
    }

    return calendarDays;
  }, [currentDate]);

  const goToPrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };
  
  const goToPrevMultiMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - multiMonthCount, 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };
  
  const goToNextMultiMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + multiMonthCount, 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  return { days, monthName, year, multiMonthName, goToNextMonth, goToPrevMonth, goToNextMultiMonth, goToPrevMultiMonth };
};
