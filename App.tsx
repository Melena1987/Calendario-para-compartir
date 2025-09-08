import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { CalendarEvent } from './types';
import { useCalendar } from './hooks/useCalendar';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import Agenda from './components/Agenda';
import Header from './components/Header';
import DownloadHeader from './components/DownloadHeader';
import { spanishHolidays } from './data/holidays';

// Declare html2canvas from the global scope
declare const html2canvas: any;

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


const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [view, setView] = useState<'calendar' | 'agenda'>('calendar');
  const [clubName, setClubName] = useState<string>(
    () => localStorage.getItem('clubName') || 'Los Monteros Racket Club'
  );

  useEffect(() => {
    localStorage.setItem('clubName', clubName);
  }, [clubName]);

  const { days, monthName, year, goToNextMonth, goToPrevMonth } = useCalendar(currentDate, setCurrentDate);

  const calendarRef = useRef<HTMLDivElement>(null);
  const agendaRef = useRef<HTMLDivElement>(null);

  const holidayEvents = useMemo((): CalendarEvent[] => {
    return spanishHolidays.map(holiday => ({
      id: `holiday-${holiday.date}`, // a stable ID
      date: holiday.date,
      title: holiday.title,
      time: '', // All-day event
      color: 'bg-green-600',
      isHoliday: true,
      isAllDay: true,
    }));
  }, []);

  const allEvents = useMemo(() => {
    return [...events, ...holidayEvents];
  }, [events, holidayEvents]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const handleSaveEvent = (event: Omit<CalendarEvent, 'id'>) => {
    setEvents([...events, { ...event, id: crypto.randomUUID() }]);
    handleCloseModal();
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };
  
  const filteredEventsForMonth = useMemo(() => {
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    return allEvents
      .filter(event => {
        const eventStart = new Date(event.date + 'T00:00:00');
        const eventEnd = event.endDate ? new Date(event.endDate + 'T00:00:00') : eventStart;
        // Make eventEnd inclusive by setting time to end of day
        eventEnd.setHours(23, 59, 59, 999);
        return eventStart <= currentMonthEnd && eventEnd >= currentMonthStart;
      })
      .sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        if (a.isAllDay && b.isAllDay) return a.title.localeCompare(b.title);
        return a.time.localeCompare(b.time);
      });
  }, [allEvents, currentDate]);

  const handleDownloadImage = useCallback(() => {
    setIsDownloading(true);
  }, []);

  useEffect(() => {
    if (!isDownloading) return;

    const timer = setTimeout(async () => {
      let elementToCapture: HTMLElement | null = null;
      let wrapperToStyle: HTMLElement | null = null;
      const originalStyles: { [key: string]: string } = {};

      if (view === 'calendar') {
        elementToCapture = calendarRef.current;
      } else {
        // For agenda, we style and capture a specific wrapper
        wrapperToStyle = document.getElementById('agenda-download-wrapper');
        elementToCapture = wrapperToStyle;
      }
      
      // Temporarily apply 9:16 aspect ratio styles for agenda download
      if (view === 'agenda' && wrapperToStyle) {
        originalStyles.width = wrapperToStyle.style.width;
        originalStyles.height = wrapperToStyle.style.height;
        originalStyles.overflow = wrapperToStyle.style.overflow;
        
        wrapperToStyle.style.width = '375px';
        wrapperToStyle.style.height = '667px'; // Common 9:16 resolution
        wrapperToStyle.style.overflow = 'hidden';
      }

      if (!elementToCapture) {
        setIsDownloading(false);
        return;
      }
      
      try {
        const contentElement = view === 'calendar' ? calendarRef.current : agendaRef.current;
        if (!contentElement) throw new Error("Content element not found");

        const backgroundColor = window.getComputedStyle(contentElement).backgroundColor;
        
        const canvas = await html2canvas(elementToCapture, {
          useCORS: true,
          scale: 3,
          backgroundColor: backgroundColor,
        });
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.href = image;
        link.download = `${view}-${monthName.toLowerCase().replace(' ', '-')}-${year}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error al generar la imagen:', error);
        alert('Hubo un problema al generar la imagen. Por favor, inténtelo de nuevo.');
      } finally {
        // Restore original styles after capture
        if (view === 'agenda' && wrapperToStyle) {
          wrapperToStyle.style.width = originalStyles.width;
          wrapperToStyle.style.height = originalStyles.height;
          wrapperToStyle.style.overflow = originalStyles.overflow;
        }
        setIsDownloading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isDownloading, monthName, year, view]);


  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Header
          clubName={clubName}
          onClubNameChange={setClubName}
          monthName={monthName}
          year={year}
          view={view}
          onViewChange={setView}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onDownload={handleDownloadImage}
        />

        <main>
          {view === 'calendar' ? (
            <div ref={calendarRef} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
              {isDownloading && <DownloadHeader clubName={clubName} monthName={monthName} year={year} />}
              <Calendar 
                days={days} 
                events={allEvents} 
                onDayClick={handleDayClick} 
                currentMonth={currentDate.getMonth()}
                isDownloading={isDownloading}
              />
            </div>
          ) : (
             <div id="agenda-download-wrapper">
                <div ref={agendaRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg h-full">
                  {isDownloading && <DownloadHeader clubName={clubName} monthName={monthName} year={year} />}
                  <Agenda events={filteredEventsForMonth} />
                </div>
              </div>
          )}
        </main>
      </div>

      {isModalOpen && selectedDate && (
        <EventModal
          date={selectedDate}
          events={allEvents.filter(e => isEventOnDay(e, selectedDate))}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default App;