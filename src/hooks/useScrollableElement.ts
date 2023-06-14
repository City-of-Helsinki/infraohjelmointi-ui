import { useEffect, useState } from 'react';

const useScrollableElement = (elementId: string) => {
  const [element, setElement] = useState<HTMLElement | undefined>(undefined);

  useEffect(() => {
    if (element) {
      return;
    }

    const interval = setInterval(() => {
      const targetTable = document.getElementById(elementId);
      if (targetTable) {
        clearInterval(interval);
        setElement(targetTable);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { element };
};

export default useScrollableElement;
