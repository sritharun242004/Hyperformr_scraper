import React from 'react';

const Header = ({ totalBusinesses = 0 }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Green "H" logo */}
            <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
              H
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hyperformr.scraper</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              <span className="font-semibold text-green-600">{totalBusinesses}</span> businesses
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;