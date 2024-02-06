/**
 * Prompts a user when they exit the page
 */
import { useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import useConfirmDialog from './useConfirmDialog';

interface IArgs {
  hash?: string;
  pathname?: string;
  search?: string;
}
const usePromptConfirmOnNavigate = ({
  title,
  description,
  when,
}: {
  title: string;
  description: string;
  when: boolean;
}) => {
  const { navigator } = useContext(NavigationContext);

  const { isConfirmed } = useConfirmDialog();

  // Toggle a warning when trying to close the window if "when" is true
  useEffect(() => {
    const promptWarningOnWindowClose = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = description;
    };

    if (when) {
      window.addEventListener('beforeunload', promptWarningOnWindowClose);
    }

    return () => {
      window.removeEventListener('beforeunload', promptWarningOnWindowClose);
    };
  }, [description, when]);

  // Open the confirmation dialog when trying to navigate to another route if "when" is true
  useEffect(() => {
    if (!when) {
      return;
    }

    const push = navigator.push;

    navigator.push = (...args: Parameters<typeof push>) => {
      const promptConfirmOnNavigate = async (args: Parameters<typeof push>) => {
        const argsProperties = args[0] as IArgs;
        if (argsProperties && argsProperties.hash) {
          // Do not await for the isConfirmed if user clicks some of the project form sidebar items because the "exit confirm" modal will be shown otherwise
          push(...args);
        } else {
          // Await for the isConfirmed to either return true or false, depending on the users input
          const confirm = await isConfirmed({ title, description });
          if (confirm !== false) {
            push(...args);
          }
        }
      };

      promptConfirmOnNavigate(args);
    };

    return () => {
      navigator.push = push;
    };
  }, [navigator, when, isConfirmed]);
};

export default usePromptConfirmOnNavigate;