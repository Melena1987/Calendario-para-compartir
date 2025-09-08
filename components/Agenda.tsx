import React, { useMemo } from 'react';
import type { CalendarEvent } from '../types';

interface AgendaProps {
  events: CalendarEvent[];
}

const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Agenda: React.FC<AgendaProps> = ({ events }) => {

  const eventsByDate = useMemo(() => {
    const acc: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
        const startDate = new Date(event.date + 'T00:00:00');
        const endDate = event.endDate ? new Date(event.endDate + 'T00:00:00') : startDate;
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = toYYYYMMDD(currentDate);
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            // Avoid pushing duplicates if event is already processed from main list
            if (!acc[dateStr].find(e => e.id === event.id)) {
               acc[dateStr].push(event);
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    // Sort events within each day
    for (const date in acc) {
        acc[date].sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            if (a.isAllDay && b.isAllDay) return a.title.localeCompare(b.title);
            return a.time.localeCompare(b.time);
        });
    }
    return acc;
  }, [events]);

  const eventDates = Object.keys(eventsByDate).sort();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No hay eventos para este mes.</p>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Puedes añadir nuevos eventos desde la vista de "Calendario".</p>
      </div>
    );
  }

  const formatDateHeader = (dateString: string) => {
    // Add T00:00:00 to parse as local time, not UTC
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {eventDates.map(date => (
        <div key={date}>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 capitalize">
            {formatDateHeader(date)}
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {eventsByDate[date].map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== eventsByDate[date].length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3 items-center">
                      <div>
                        <span className={`h-8 w-8 rounded-full ${event.color} flex items-center justify-center ring-8 ring-white dark:ring-gray-800`}>
                           {/* An icon could be placed here in the future */}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center flex-wrap gap-x-2">
                            <p className="text-md font-semibold text-gray-900 dark:text-white flex-1">{event.title}</p>
                             {event.isAllDay ? (
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">Todo el día</span>
                            ) : (
                              event.time && <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{event.time}</p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Agenda;