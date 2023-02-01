import { useEffect, useMemo, useState } from 'react';

const useIsInViewPort = (ref: any) => {
  const [isInViewPort, setIsInViewPort] = useState(false);
  const [dimensions, setDimensions] = useState<DOMRectReadOnly>();

  // Memoize observer to avoid creating a new one each time the ref is rendered
  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) => {
        const bounding = entry.boundingClientRect;

        setDimensions(bounding);
        // Set in viewport
        setIsInViewPort(
          bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight),
        );
      }),
    [],
  );

  useEffect(() => {
    observer.observe(ref.current);
    // Clean up observer
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isInViewPort, dimensions };
};

export default useIsInViewPort;
