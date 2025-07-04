import React, { createContext, useState, useContext } from 'react';

interface EmpresaInfo {
  nombre: string;
  rfc: string;
}

interface EmpresaContextType {
  empresaInfo: EmpresaInfo;
  setEmpresaInfo: (info: EmpresaInfo) => void;
}

const defaultEmpresaInfo: EmpresaInfo = {
  nombre: 'Empresa Ejemplo S.A. de C.V.',
  rfc: 'EEJ920629TE3'
};

export const EmpresaContext = createContext<EmpresaContextType>({} as EmpresaContextType);

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo>(() => {
    const stored = localStorage.getItem('empresaInfo');
    return stored ? JSON.parse(stored) : defaultEmpresaInfo;
  });

  const updateEmpresaInfo = (info: EmpresaInfo) => {
    setEmpresaInfo(info);
    localStorage.setItem('empresaInfo', JSON.stringify(info));
  };

  return (
    <EmpresaContext.Provider value={{ empresaInfo, setEmpresaInfo: updateEmpresaInfo }}>
      {children}
    </EmpresaContext.Provider>
  );
};

export const useEmpresa = () => useContext(EmpresaContext);