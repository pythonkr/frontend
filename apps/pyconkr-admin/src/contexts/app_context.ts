import { createContext, useContext } from "react";

export type AppContextValue = {
  setUnsavedChanges: (value: boolean) => void;
  confirmLeaveIfUnsaved: () => boolean;
};

export const AppContext = createContext<AppContextValue | null>(null);

export const useAppContext = (): AppContextValue => {
  const value = useContext(AppContext);
  if (!value) throw new Error("useAppContext must be used within an AppContextProvider");
  return value;
};
