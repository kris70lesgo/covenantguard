import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

/**
 * DashboardGrid
 * Implements the specific 2-column layout.
 * Left column is slightly wider or equal depending on content.
 */
const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl mx-auto p-6 lg:p-12 items-start">
      {children}
    </div>
  );
};

export default DashboardGrid;