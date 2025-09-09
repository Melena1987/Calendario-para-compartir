import React from 'react';
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, ListBulletIcon, ShareIcon } from './Icons';
import InstallPWA from './InstallPWA';

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
    onShare: () => void;
}

const Header: React.FC<HeaderProps> = ({ clubName, onClubNameChange, monthName, year, view, onViewChange, onPrevMonth, onNextMonth, onDownload, onShare }) => {
    return (
      <header className="flex flex-wrap items-center justify-between mb-6 gap-y-4 gap-x-4">
        <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              value={clubName}
              onChange={(e) => onClubNameChange(e.target.value)}
              aria-label="Nombre del club, editable"
              className="w-full text-2xl sm:text-3xl font-sans text-gray-900 dark:text-white bg-transparent outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 -mx-2"
            />
            <p className="text-lg sm:text-xl font-sans font-light text-gray-500 dark:text-gray-400 capitalize px-2">{monthName} {year}</p>
        </div>
        
        <div className="flex items-center flex-shrink-0 flex-wrap justify-end gap-2">
          {/* View Switcher */}
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => onViewChange('calendar')}
              aria-label="Vista Calendario"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === 'calendar' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <CalendarDaysIcon className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Calendario</span>
            </button>
            <button
              onClick={() => onViewChange('agenda')}
              aria-label="Vista Agenda"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${view === 'agenda' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow' : 'text-gray-600 dark:text-gray-300'}`}
            >
              <ListBulletIcon className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Agenda</span>
            </button>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center">
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
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <InstallPWA />
            <button
              onClick={onShare}
              aria-label="Compartir"
              className="flex items-center justify-center bg-green-500 text-white font-semibold p-2.5 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md"
            >
              <ShareIcon className="h-5 w-5 flex-shrink-0" />
            </button>
            <button
              onClick={onDownload}
              aria-label="Descargar"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
            >
              <DownloadIcon className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
          </div>
        </div>
      </header>
    );
};

export default Header;