import { useState, useMemo } from 'react';

export const useCalendar = (initialDate: Date, onDateChange: (date: Date) => void) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  const monthName = useMemo(() => currentDate.toLocaleDateString('es-ES', { month: 'long' }), [currentDate]);
  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);

  const quarterName = useMemo(() => {
    const m1 = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const m3 = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1);
    
    const month1Name = m1.toLocaleDateString('es-ES', { month: 'long' });
    const month3Name = m3.toLocaleDateString('es-ES', { month: 'long' });
    const year1 = m1.getFullYear();
    const year3 = m3.getFullYear();
    
    const yearString = year1 === year3 ? year1.toString() : `${year1} - ${year3}`;
    
    return `${month1Name} - ${month3Name} ${yearString}`;
  }, [currentDate]);

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
  
  const goToPrevQuarter = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };
  
  const goToNextQuarter = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1);
    setCurrentDate(newDate);
    onDateChange(newDate);
  };

  return { days, monthName, year, quarterName, goToNextMonth, goToPrevMonth, goToNextQuarter, goToPrevQuarter };
};