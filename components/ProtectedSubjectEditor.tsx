import React, { useState, useEffect, useRef } from 'react';

interface ProtectedSubjectEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const ProtectedSubjectEditor: React.FC<ProtectedSubjectEditorProps> = ({
  value,
  onChange,
  placeholder = "Asunto del correo electrónico",
  className = "",
  required = false
}) => {
  const [protectedContent, setProtectedContent] = useState<string>('');
  const [editableContent, setEditableContent] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Variables dinámicas que deben protegerse en el asunto
  const protectedVariables = ['{serie}', '{folio}', '{uuid}', '{rfcReceptor}', '{facturaInfo}'];

  // Todo el asunto debe estar protegido
  const protectedTexts = [
    'Factura Electrónica {serie} - {folio} - {uuid} - RFC: {rfcReceptor} - {facturaInfo}'
  ];

  useEffect(() => {
    separateContent();
  }, [value]);

  const isProtectedText = (text: string): boolean => {
    return protectedTexts.some(protectedText => 
      text.toLowerCase().includes(protectedText.toLowerCase())
    );
  };

  const isProtectedVariable = (text: string): boolean => {
    return protectedVariables.some(variable => text.includes(variable));
  };

  const separateContent = () => {
    // Todo el asunto debe estar protegido - no hay contenido editable
    const fixedProtectedContent = 'Factura Electrónica {serie} - {folio} - {uuid} - RFC: {rfcReceptor} - {facturaInfo}';
    
    setProtectedContent(fixedProtectedContent);
    setEditableContent(''); // El asunto no tiene contenido editable
  };

  const handleEditableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEditableContent = e.target.value;
    setEditableContent(newEditableContent);
    
    // Para el asunto, siempre usar solo el contenido protegido
    const fixedProtectedContent = 'Factura Electrónica {serie} - {folio} - {uuid} - RFC: {rfcReceptor} - {facturaInfo}';
    onChange(fixedProtectedContent);
  };

  const renderProtectedContent = () => {
    if (!protectedContent) {
      return (
        <div className="text-gray-400 dark:text-gray-500 italic text-sm">
          No hay contenido protegido
        </div>
      );
    }

    // Dividir el contenido protegido para mostrar variables y texto por separado
    const parts = protectedContent.split(/(\{[^}]+\})/);
    
    return (
      <div className="flex flex-wrap items-center gap-1">
        {parts.map((part, index) => {
          if (!part) return null;
          
          const isVariable = protectedVariables.some(variable => part === variable);
          
          if (isVariable) {
            return (
              <span
                key={`var-${index}`}
                className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded border border-yellow-300 dark:border-yellow-700 font-mono text-sm"
              >
                {part}
              </span>
            );
          } else {
            return (
              <span
                key={`text-${index}`}
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded border border-blue-300 dark:border-blue-700 text-sm"
              >
                {part}
              </span>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
          {protectedContent}
        </div>
      </div>
    </div>
  );
};