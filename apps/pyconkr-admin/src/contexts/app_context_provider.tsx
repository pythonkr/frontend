import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { AppContext, AppContextValue } from "./app_context";

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [hasUnsavedChanges, setUnsavedChanges] = useState(false);

  // TODO: react-router 를 data router 로 이관하면, 아래 수동 confirm/beforeunload 가드를 useBlocker 로 대체한다.
  //       (현재 앱은 선언형 <BrowserRouter> 라 useBlocker 를 쓸 수 없다.)
  const confirmLeaveIfUnsaved = useCallback(
    () => !hasUnsavedChanges || window.confirm("저장하지 않은 변경사항이 있습니다. 저장하지 않고 이동하시겠습니까?"),
    [hasUnsavedChanges]
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const value = useMemo<AppContextValue>(() => ({ setUnsavedChanges, confirmLeaveIfUnsaved }), [setUnsavedChanges, confirmLeaveIfUnsaved]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
