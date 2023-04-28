import { Alert, Snackbar } from '@mui/material';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

type Notification = {
  message: string;
  severity: 'error' | 'success' | 'warning' | 'info';
};

type NotificationContext = {
  addNotification: (notification: Notification) => void;
};

const Context = createContext<NotificationContext>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addNotification: () => {},
});

type NotificationManagerProps = { children: ReactNode };

export const NotificationManager = ({ children }: NotificationManagerProps) => {
  const [notification, setNotification] = useState<Notification | undefined>();

  const handleClose = () => {
    setNotification(undefined);
  };

  const addNotification = useCallback<NotificationContext['addNotification']>(
    (newNotification: Notification) => {
      setNotification(newNotification);
    },
    [setNotification]
  );

  return (
    <Context.Provider value={{ addNotification }}>
      {children}
      <Snackbar
        open={!!notification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        {notification && (
          <Alert onClose={handleClose} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Context.Provider>
  );
};

export const useNotification = () => useContext(Context);
