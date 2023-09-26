import React, { ReactNode, createContext, memo, useState } from 'react';
export type IConfirmDialogTypes = 'confirm' | 'delete';
interface IConfirmDialogContext {
  dialogType?: IConfirmDialogTypes;
  title: string;
  description: string;
  isOpen: boolean;
  proceed: null | ((value: unknown) => void);
  cancel: null | ((value: unknown) => void);
  confirmButtonText?: string;
}

const initialConfirmDialogContext: IConfirmDialogContext = {
  dialogType: 'confirm',
  title: '',
  description: '',
  isOpen: false,
  proceed: null,
  cancel: null,
  confirmButtonText: 'proceed',
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

export default memo(ConfirmDialogContextProvider);
