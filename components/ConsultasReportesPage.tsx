import React from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { REPORT_BUTTON_LIST } from '../constants';

export const ConsultasReportesPage: React.FC = () => {
  const handleReportButtonClick = (reportName: string) => {
    alert(`Generando reporte: "${reportName}" (simulado).`);
  };

  const numColumns = Math.min(REPORT_BUTTON_LIST.length, 4);

  return (
    <Card>
      <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
        Seleccione un reporte:
      </h3>
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${numColumns} gap-3`}>
        {REPORT_BUTTON_LIST.map((reportName) => (
          <Button
            key={reportName}
            type="button"
            variant="neutral"
            onClick={() => handleReportButtonClick(reportName)}
            className="w-full h-full text-xs text-center break-words whitespace-normal py-3 px-2 justify-center" 
          >
            {reportName}
          </Button>
        ))}
      </div>
       <div className="mt-8 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
        El reporte seleccionado se mostrará o descargará aquí.
      </div>
    </Card>
  );
};
