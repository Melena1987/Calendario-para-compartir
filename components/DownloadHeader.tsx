import React from 'react';

interface DownloadHeaderProps {
  clubName: string;
  monthName: string;
  year: number;
}

const DownloadHeader: React.FC<DownloadHeaderProps> = ({ clubName, monthName, year }) => {
  return (
    <div className="flex justify-between items-baseline p-6 bg-inherit border-b border-gray-200 dark:border-gray-700 mb-4">
      <h2 className="text-3xl font-serif text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis pr-4">{clubName}</h2>
      <p className="text-xl font-sans font-light text-gray-500 dark:text-gray-400 capitalize whitespace-nowrap">{monthName} {year}</p>
    </div>
  );
};

export default DownloadHeader;
