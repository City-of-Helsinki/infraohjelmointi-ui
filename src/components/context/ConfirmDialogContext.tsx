import React, { ReactNode, createContext, useState } from 'react';

interface IConfirmDialogContext {
  title: string;
  description: string;
  isOpen: boolean;
  proceed: null | ((value: unknown) => void);
  cancel: null | ((value: unknown) => void);
}

const initialConfirmDialogContext: IConfirmDialogContext = {
  title: '',
  description: '',
  isOpen: false,
  proceed: null,
  cancel: null,
};

export const ConfirmDialogContext = createContext<
  [IConfirmDialogContext, React.Dispatch<React.SetStateAction<IConfirmDialogContext>>]
>([
  initialConfirmDialogContext,
  null as unknown as React.Dispatch<React.SetStateAction<IConfirmDialogContext>>,
]);

const ConfirmDialogContextProvider = ({ children }: { children: ReactNode }) => {
  const [confirm, setConfirm] = useState(initialConfirmDialogContext);

  return (
    <ConfirmDialogContext.Provider value={[confirm, setConfirm]}>
      {children}
    </ConfirmDialogContext.Provider>
  );
};

export default ConfirmDialogContextProvider;
