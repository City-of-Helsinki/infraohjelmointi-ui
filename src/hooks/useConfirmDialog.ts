import {
  ConfirmDialogContext,
  IConfirmDialogTypes,
} from '@/components/context/ConfirmDialogContext';
import { useContext, useEffect, useState } from 'react';

/**
 * Returns the current state of the confirm dialog context and a "isConfirmed" function that can
 * be awaited to confirmation prompts before other actions can trigger
 */
const useConfirmDialog = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [confirm, setConfirm] = useContext(ConfirmDialogContext);
  const [needsCleanup, setNeedsCleanup] = useState(false);

  // Sets the confirm dialog context values and returns a promise that needs to be awaited to
  // simulate what the built-in window.confirm() does
  const isConfirmed = ({
    title,
    description,
    dialogType,
  }: {
    title: string;
    description: string;
    dialogType?: IConfirmDialogTypes;
  }) => {
    setNeedsCleanup(true);
    return new Promise((resolve, reject) => {
      setConfirm({
        dialogType: dialogType ? dialogType : 'default',
        title,
        description,
        isOpen: true,
        proceed: resolve,
        cancel: reject,
      });
    }).then(
      () => {
        setConfirm({ ...confirm, isOpen: false });
        return true;
      },
      () => {
        setConfirm({ ...confirm, isOpen: false });
        return false;
      },
    );
  };

  // Avoid possible memory leak with cleanup if the user clicks cancel
  useEffect(() => {
    return () => {
      if (confirm.cancel && needsCleanup) {
        confirm.cancel(null);
      }
    };
  }, [confirm, needsCleanup]);

  return {
    ...confirm,
    isConfirmed,
  };
};

export default useConfirmDialog;
