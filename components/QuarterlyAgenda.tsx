import React, { useMemo } from 'react';
import type { CalendarEvent } from '../types';

interface QuarterlyAgendaProps {
  events: CalendarEvent[];
  startDate: Date;
}

const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const QuarterlyAgenda: React.FC<QuarterlyAgendaProps> = ({ events, startDate }) => {
  const monthsInQuarter = useMemo(() => [
    new Date(startDate.getFullYear(), startDate.getMonth(), 1),
    new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1),
    new Date(startDate.getFullYear(), startDate.getMonth() + 2, 1),
  ], [startDate]);

  const eventsByMonth = useMemo(() => {
    const monthlyEvents: Record<string, CalendarEvent[]> = {};

    monthsInQuarter.forEach(monthDate => {
      const monthKey = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const monthStart = monthDate;
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const filtered = events.filter(event => {
        const eventStart = new Date(event.date + 'T00:00:00');
        const eventEnd = event.endDate ? new Date(event.endDate + 'T00:00:00') : eventStart;
        eventEnd.setHours(23, 59, 59, 999);
        return eventStart <= monthEnd && eventEnd >= monthStart;
      });
      
      if (filtered.length > 0) {
        monthlyEvents[monthKey] = filtered;
      }
    });

    return monthlyEvents;
  }, [events, monthsInQuarter]);
  
  const formatDateHeader = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">No hay eventos para este trimestre.</p>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Puedes añadir nuevos eventos desde la vista de "Calendario".</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(eventsByMonth).map(([monthKey, monthEvents]) => {
        const eventsByDate = monthEvents.reduce((acc, event) => {
            const startDate = new Date(event.date + 'T00:00:00');
            const endDate = event.endDate ? new Date(event.endDate + 'T00:00:00') : startDate;
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const dateStr = toYYYYMMDD(currentDate);
                if (!acc[dateStr]) acc[dateStr] = [];
                if (!acc[dateStr].find(e => e.id === event.id)) {
                   acc[dateStr].push(event);
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return acc;
        }, {} as Record<string, CalendarEvent[]>);

        for (const date in eventsByDate) {
            eventsByDate[date].sort((a, b) => {
                if (a.isAllDay && !b.isAllDay) return -1;
                if (!a.isAllDay && b.isAllDay) return 1;
                if (a.isAllDay && b.isAllDay) return a.title.localeCompare(b.title);
                return a.time.localeCompare(b.time);
            });
        }
        
        const sortedDates = Object.keys(eventsByDate).sort();

        return (
          <div key={monthKey}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 capitalize">{monthKey}</h2>
            <div className="space-y-8">
              {sortedDates.map(date => (
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
                                <span className={`h-8 w-8 rounded-full ${event.color} flex items-center justify-center ring-8 ring-white dark:ring-gray-800`}></span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex justify-between items-center flex-wrap gap-x-2">
                                  <p className="text-md font-semibold text-gray-900 dark:text-white flex-1">{event.title}</p>
                                  {event.isAllDay ? (
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Todo el día</span>
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
          </div>
        );
      })}
    </div>
  );
};

export default QuarterlyAgenda;