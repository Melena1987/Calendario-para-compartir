import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { CalendarEvent } from './types';
import { useCalendar } from './hooks/useCalendar';
import Calendar from './components/Calendar';
import EventModal from './components/EventModal';
import Agenda from './components/Agenda';
import Header from './components/Header';
import DownloadHeader from './components/DownloadHeader';
import InstallPWA from './components/InstallPWA';
import QuarterlyAgenda from './components/QuarterlyAgenda';
import { db } from './firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
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
  const [captureAction, setCaptureAction] = useState<'download' | 'share' | null>(null);
  const isCapturing = captureAction !== null;
  const [view, setView] = useState<'calendar' | 'agenda' | 'quarterly'>('calendar');
  const [clubName, setClubName] = useState<string>('Los Monteros Racket Club');

  // This useEffect will run once to seed holidays into Firestore if they haven't been seeded before.
  useEffect(() => {
    const seedHolidaysOnce = async () => {
      const settingsRef = doc(db, 'settings', 'appConfig');
      try {
        const settingsSnap = await getDoc(settingsRef);
        
        if (!settingsSnap.exists() || !settingsSnap.data().holidaysSeeded) {
          console.log('First time setup: Seeding holidays into the database...');
          
          const batch = writeBatch(db);
          
          // Add holidays
          spanishHolidays.forEach(holiday => {
            const newEventRef = doc(collection(db, "events"));
            batch.set(newEventRef, {
              title: holiday.title,
              date: holiday.date,
              isAllDay: true,
              isHoliday: true,
              color: 'bg-green-600',
              time: '',
            });
          });
          
          // Set the seeded flag to prevent re-seeding
          batch.set(settingsRef, { holidaysSeeded: true }, { merge: true });
          
          await batch.commit();
          console.log('Holidays seeded successfully.');
        }
      } catch (error) {
         console.error("Error during holiday seeding check:", error);
      }
    };
  
    seedHolidaysOnce();
  }, []); // Empty dependency array ensures this runs only once on mount.


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

  const { days, monthName, year, quarterName, goToNextMonth, goToPrevMonth, goToNextQuarter, goToPrevQuarter } = useCalendar(currentDate, setCurrentDate);

  const calendarRef = useRef<HTMLDivElement>(null);
  const agendaRef = useRef<HTMLDivElement>(null);
  const quarterlyAgendaRef = useRef<HTMLDivElement>(null);

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
  
  const handleUpdateEvent = async (event: CalendarEvent) => {
    try {
      const eventRef = doc(db, 'events', event.id);
      const { id, ...eventData } = event;
      await setDoc(eventRef, eventData);
      handleCloseModal();
    } catch (e) {
      console.error("Error updating document: ", e);
      alert("Hubo un error al actualizar el evento.");
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

    return events
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
  }, [events, currentDate]);

  const filteredEventsForQuarter = useMemo(() => {
    const quarterStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const quarterEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 0);
    quarterEnd.setHours(23, 59, 59, 999);

    return events
      .filter(event => {
        const eventStart = new Date(event.date + 'T00:00:00');
        const eventEnd = event.endDate ? new Date(event.endDate + 'T00:00:00') : eventStart;
        eventEnd.setHours(23, 59, 59, 999);
        return eventStart <= quarterEnd && eventEnd >= quarterStart;
      })
      .sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        if (a.isAllDay && !b.isAllDay) return -1;
        if (!a.isAllDay && b.isAllDay) return 1;
        if (a.isAllDay && b.isAllDay) return a.title.localeCompare(b.title);
        return a.time.localeCompare(b.time);
      });
  }, [events, currentDate]);


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
  
    const performCapture = async () => {
      let elementToCapture: HTMLDivElement | null = null;
      switch(view) {
        case 'calendar':
          elementToCapture = calendarRef.current;
          break;
        case 'agenda':
          elementToCapture = agendaRef.current;
          break;
        case 'quarterly':
          elementToCapture = quarterlyAgendaRef.current;
          break;
      }
      
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
        // A little delay to ensure styles are applied after potential DOM changes
        await new Promise(resolve => setTimeout(resolve, 300));
  
        const backgroundColor = window.getComputedStyle(elementToCapture).backgroundColor;
  
        const canvas = await html2canvas(elementToCapture, {
          useCORS: true,
          scale: 3,
          backgroundColor: backgroundColor,
        });
        
        const title = view === 'quarterly' ? quarterName : `${monthName} ${year}`;
        const filename = `${view}-${title.toLowerCase().replace(/\s/g, '-')}.png`;
  
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
                  title: `Calendario ${clubName} - ${title}`,
                  text: `Aquí está el calendario de ${clubName} para ${title}.`,
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
    };
  
    // Wait for fonts to be ready, then capture
    document.fonts.ready.then(performCapture);
  
  }, [captureAction, monthName, year, view, clubName, quarterName]);


  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-grow">
        <Header
          clubName={clubName}
          onClubNameChange={handleClubNameChange}
          monthName={monthName}
          year={year}
          quarterName={quarterName}
          view={view}
          onViewChange={setView}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onPrevQuarter={goToPrevQuarter}
          onNextQuarter={goToNextQuarter}
          onDownload={handleDownloadImage}
          onShare={handleShare}
        />

        <main>
          {view === 'calendar' && (
            <div ref={calendarRef} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
              {isCapturing && <DownloadHeader clubName={clubName} monthName={monthName} year={year} />}
              <Calendar 
                days={days} 
                events={events} 
                onDayClick={handleDayClick} 
                currentMonth={currentDate.getMonth()}
                isCapturing={isCapturing}
              />
            </div>
          )}
          {view === 'agenda' && (
            <div ref={agendaRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
              {isCapturing && <DownloadHeader clubName={clubName} monthName={monthName} year={year} />}
              <Agenda events={filteredEventsForMonth} />
            </div>
          )}
          {view === 'quarterly' && (
            <div ref={quarterlyAgendaRef} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
              {isCapturing && <DownloadHeader clubName={clubName} monthName={quarterName} year={null} />}
              <QuarterlyAgenda events={filteredEventsForQuarter} startDate={currentDate} />
            </div>
          )}
        </main>
      </div>

      <footer className="py-6 flex justify-center items-center">
        <InstallPWA />
      </footer>

      {isModalOpen && selectedDate && (
        <EventModal
          date={selectedDate}
          events={events.filter(e => isEventOnDay(e, selectedDate))}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default App;