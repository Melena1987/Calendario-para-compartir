import React from 'react';

interface DownloadHeaderProps {
  clubName: string;
  monthName: string;
  year: number;
}

const DownloadHeader: React.FC<DownloadHeaderProps> = ({ clubName, monthName, year }) => {
  return (
    <div className="text-center p-6 bg-inherit border-b border-gray-200 dark:border-gray-700 mb-4">
      <h2 className="text-4xl font-sans text-gray-900 dark:text-white">{clubName}</h2>
      <p className="text-2xl font-sans font-light text-gray-500 dark:text-gray-400 capitalize mt-2">{monthName} {year}</p>
    </div>
  );
};

export default DownloadHeader;