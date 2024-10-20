import React from 'react';

const Header = () => (
  <header className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <h1 className="text-2xl font-semibold text-gray-800">AI App</h1>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-white border-t border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <p className="text-center text-gray-500 text-sm">© 2024 AI App. All rights reserved.</p>
    </div>
  </footer>
);

const Column = ({ children, width }) => (
  <div className={`${width} px-2 mb-4`}>
    <div className="bg-white rounded-lg shadow-sm p-6">
      {children}
    </div>
  </div>
);

const FlexibleLayout = ({ columns, children }) => {
  // Ensure columns is between 1 and 5
  const numColumns = Math.max(1, Math.min(5, columns));
  
  const getColumnWidth = () => {
    switch (numColumns) {
      case 1: return 'w-full';
      case 2: return 'w-1/2';
      case 3: return 'w-1/3';
      case 4: return 'w-1/4';
      case 5: return 'w-1/5';
      default: return 'w-full';
    }
  };

  const columnWidth = getColumnWidth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap -mx-2">
          {[...Array(numColumns)].map((_, index) => (
            <Column key={index} width={columnWidth}>
              {children({ columnIndex: index, numColumns })}
            </Column>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export { FlexibleLayout };