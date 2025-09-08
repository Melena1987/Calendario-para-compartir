import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { CalendarEvent } from './types';
import { useCalendar } from './hooks/useCalendar';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import Agenda from './components/Agenda';
import Header from './components/Header';
import DownloadHeader from './components/DownloadHeader';
import { spanishHolidays } from './data/holidays';
import { db } from './firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';


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
  const [captureAction, setCaptureAction] = useState<'download' | 'share' | null>(null);
  const isCapturing = captureAction !== null;
  const [view, setView] = useState<'calendar' | 'agenda'>('calendar');
  const [clubName, setClubName] = useState<string>('Los Monteros Racket Club');

  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData: CalendarEvent[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        eventsData.push({
          id: doc.id,
          date: data.date,
          endDate: data.endDate,
          title: data.title,
          time: data.time,
          color: data.color,
          isAllDay: data.isAllDay,
          isHoliday: data.isHoliday,
        });
      });
      setEvents(eventsData);
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const clubNameDocRef = doc(db, 'settings', 'appConfig');
    const unsubscribe = onSnapshot(clubNameDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().clubName) {
        setClubName(docSnap.data().clubName);
      } else {
        setClubName('Los Monteros Racket Club');
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  const handleClubNameChange = async (name: string) => {
      setClubName(name);
      try {
          const clubNameDocRef = doc(db, 'settings', 'appConfig');
          await setDoc(clubNameDocRef, { clubName: name }, { merge: true });
      } catch (e) {
          console.error("Error updating club name: ", e);
          alert("Hubo un error al actualizar el nombre del club.");
      }
  }

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

  const handleSaveEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      await addDoc(collection(db, 'events'), event);
      handleCloseModal();
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Hubo un error al guardar el evento.");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (e) {
      console.error("Error deleting document: ", e);
      alert("Hubo un error al eliminar el evento.");
    }
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
    setCaptureAction('download');
  }, []);

  const handleShare = useCallback(() => {
    if (!navigator.share) {
      alert('La función de compartir no es compatible con este navegador. En su lugar, se descargará la imagen.');
      setCaptureAction('download');
    } else {
      setCaptureAction('share');
    }
  }, []);

  useEffect(() => {
    if (!captureAction) return;

    const timer = setTimeout(async () => {
      const elementToCapture = view === 'calendar' ? calendarRef.current : agendaRef.current;
      const elementToStyle = view === 'agenda' ? agendaRef.current : null;
      const originalStyles: { [key: string]: string } = {};

      if (elementToStyle) {
        originalStyles.width = elementToStyle.style.width;
        originalStyles.height = elementToStyle.style.height;
        originalStyles.overflow = elementToStyle.style.overflow;
        
        elementToStyle.style.width = '375px';
        elementToStyle.style.height = '667px';
        elementToStyle.style.overflow = 'hidden';
      }

      if (!elementToCapture) {
        setCaptureAction(null);
        return;
      }
      
      try {
        const backgroundColor = window.getComputedStyle(elementToCapture).backgroundColor;
        
        const canvas = await html2canvas(elementToCapture, {
          useCORS: true,
          scale: 3,
          backgroundColor: backgroundColor,
        });
        
        const filename = `${view}-${monthName.toLowerCase().replace(' ', '-')}-${year}.png`;

        if (captureAction === 'download') {
          const image = canvas.toDataURL('image/png', 1.0);
          const link = document.createElement('a');
          link.href = image;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (captureAction === 'share') {
           canvas.toBlob(async (blob) => {
            if (blob && navigator.share) {
              const file = new File([blob], filename, { type: 'image/png' });
              try {
                await navigator.share({
                  files: [file],
                  title: `Calendario ${clubName} - ${monthName} ${year}`,
                  text: `Aquí está el calendario de ${clubName} para ${monthName}.`,
                });
              } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                  console.error('Error al compartir:', error);
                  alert('Hubo un problema al intentar compartir la imagen.');
                }
              }
            }
          }, 'image/png');
        }

      } catch (error) {
        console.error('Error al generar la imagen:', error);
        alert('Hubo un problema al generar la imagen. Por favor, inténtelo de nuevo.');
      } finally {
        if (elementToStyle) {
          elementToStyle.style.width = originalStyles.width;
          elementToStyle.style.height = originalStyles.height;
          elementToStyle.style.overflow = originalStyles.overflow;
        }
        setCaptureAction(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [captureAction, monthName, year, view, clubName]);


  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Header
          clubName={clubName}
          onClubNameChange={handleClubNameChange}
          monthName={monthName}
          year={year}
          view={view}
          onViewChange={setView}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onDownload={handleDownloadImage}
          onShare={handleShare}
        />

        <main>
          {view === 'calendar' ? (
            <div ref={calendarRef} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
              {isCapturing && <DownloadHeader clubName={clubName} monthName={monthName} year={year} />}
              <Calendar 
                days={days} 
                events={allEvents} 
                onDayClick={handleDayClick} 
                currentMonth={currentDate.getMonth()}
                isCapturing={isCapturing}
              />
            </div>
          ) : (
            <div ref={agendaRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
              {isCapturing && <DownloadHeader clubName={clubName} monthName={monthName} year={year} />}
              <Agenda events={filteredEventsForMonth} />
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