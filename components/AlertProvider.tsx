'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Alert, { AlertOptions } from './Alert';

interface AlertContextType {
  showAlert: (options: AlertOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertOptions & { isOpen: boolean }>({
    isOpen: false,
    message: '',
  });

  const showAlert = useCallback((options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlert({
        ...options,
        isOpen: true,
        onConfirm: () => {
          if (options.onConfirm) {
            options.onConfirm();
          }
          resolve(true);
        },
        onCancel: () => {
          if (options.onCancel) {
            options.onCancel();
          }
          resolve(false);
        },
      });
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <Alert {...alert} isOpen={alert.isOpen} onClose={closeAlert} />
    </AlertContext.Provider>
  );
};



