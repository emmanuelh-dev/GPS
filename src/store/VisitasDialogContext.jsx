import { createContext, useContext, useState, useCallback } from "react";

export const VisitasDialogContext = createContext();

export const VisitasDialogProvider = ({ children }) => {
  const [openVisitas, setOpenVisitas] = useState(false);
  const [device, setDeviceVisitas] = useState(null);

  const onCloseVisitas = () => setOpenVisitas(false);

  const onSave = (newDevice) => {
    setDeviceVisitas(newDevice);
    setOpenVisitas(false);
  };

  return (
    <VisitasDialogContext.Provider
      value={{ openVisitas, onCloseVisitas, device, onSave, setOpenVisitas, setDeviceVisitas }}
    >
      {children}
    </VisitasDialogContext.Provider>
  );
};

export const useVisitasDialog = () => useContext(VisitasDialogContext);
