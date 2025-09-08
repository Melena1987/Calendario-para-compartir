import React from 'react';
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, ListBulletIcon } from './Icons';

interface HeaderProps {
    clubName: string;
    onClubNameChange: (name: string) => void;
    monthName: string;
    year: number;
    view: 'calendar' | 'agenda';
    onViewChange: (view: 'calendar' | 'agenda') => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onDownload: () => void;
}

const Header: React.FC<HeaderProps> = ({ clubName, onClubNameChange, monthName, year, view, onViewChange, onPrevMonth, onNextMonth, onDownload }) => {
    return (
      <header className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <div className="text-center sm:text-left">
            <input
              type="text"
              value={clubName}
              onChange={(e) => onClubNameChange(e.target.value)}
              aria-label="Nombre del club, editable"
              className="w-full sm:w-auto text-3xl sm:text-4xl font-serif text-gray-900 dark:text-white bg-transparent outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 -mx-2 text-center sm:text-left"
            />
            <p className="text-xl sm:text-2xl font-sans font-light text-gray-500 dark:text-gray-400 capitalize">{monthName} {year}</p>
        </div>
        <div className="flex items-center flex-wrap justify-center gap-2 mt-4 sm:mt-0">
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewChange('calendar')}
              aria-label="Vista Calendario"
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-colors ${view === 'calendar' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <CalendarDaysIcon className="h-5 w-5" />
              <span>Calendario</span>
            </button>
            <button
              onClick={() => onViewChange('agenda')}
              aria-label="Vista Agenda"
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-colors ${view === 'agenda' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <ListBulletIcon className="h-5 w-5" />
              <span>Agenda</span>
            </button>
          </div>
          
          <button
            onClick={onPrevMonth}
            aria-label="Mes anterior"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={onNextMonth}
            aria-label="Mes siguiente"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
          <button
            onClick={onDownload}
            className="flex items-center space-x-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
            <DownloadIcon className="h-5 w-5" />
            <span>Descargar</span>
          </button>
        </div>
      </header>
    );
};

export default Header;