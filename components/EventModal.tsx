import React, { useState } from 'react';
import type { CalendarEvent } from '../types';
import { TrashIcon } from './Icons';

interface EventModalProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete: (eventId: string) => void;
}

// A helper function to format a Date object to 'YYYY-MM-DD' respecting the local timezone.
const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500'
];

const EventModal: React.FC<EventModalProps> = ({ date, events, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('12:00');
  const [color, setColor] = useState(COLORS[5]);
  const [isAllDay, setIsAllDay] = useState(false);
  const [endDate, setEndDate] = useState(toYYYYMMDD(date));

  const formattedDate = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      const startDateStr = toYYYYMMDD(date);
      const hasDifferentEndDate = endDate && endDate !== startDateStr;

      if (hasDifferentEndDate && endDate < startDateStr) {
        alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
        return;
      }

      const newEvent: Omit<CalendarEvent, 'id' | 'endDate'> & { endDate?: string } = {
        date: startDateStr,
        title,
        time: isAllDay ? '' : time,
        color,
        isAllDay,
      };

      if (hasDifferentEndDate) {
        newEvent.endDate = endDate;
      }

      onSave(newEvent);

      setTitle('');
      setTime('12:00');
      setColor(COLORS[5]);
      setIsAllDay(false);
      setEndDate(toYYYYMMDD(date));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Eventos para el</h2>
          <p className="text-md text-blue-600 dark:text-blue-400 font-semibold mb-4 capitalize">{formattedDate}</p>
          
          <div className="max-h-32 overflow-y-auto mb-4 space-y-2">
            {events.length > 0 ? (
              events.map(event => (
                <div key={event.id} className={`flex items-center justify-between p-2 rounded-md ${event.color} text-white`}>
                  <div>
                    <p className="font-bold">{event.title}</p>
                    {!event.isAllDay && event.time && <p className="text-sm">{event.time}</p>}
                  </div>
                  {!event.isHoliday && (
                    <button onClick={() => onDelete(event.id)} className="p-1 rounded-full hover:bg-black/20">
                      <TrashIcon className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay eventos para este día.</p>
            )}
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Añadir nuevo evento</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título del evento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha de fin <span className="text-xs">(opcional)</span>
                    </label>
                    <input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      min={toYYYYMMDD(date)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  {!isAllDay && (
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hora</label>
                       <input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required={!isAllDay}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="all-day"
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="all-day" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Todo el día
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full ${c} transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800' : ''}`}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;