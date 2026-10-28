import { RefObject, useEffect, useRef } from 'react';

/**
 * Executes a given callback function if a click event happens outside of the given ref
 *
 * elementRendered is a "hacky" solution to get this hook to evaluate refs that are hidden conditionally,
 * and is currently used in PlanningForecastSums.tsx and PlanningCell.tsx. Improvements are welcome.
 */
const useOnClickOutsideRef = (
  ref: RefObject<HTMLElement>,
  callback: () => unknown,
  elementRendered?: boolean,
) => {
  // Keeps the listener stable while always calling the latest callback
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!ref?.current) {
      return;
    }

    const refElement = ref?.current;

    const executeCallbackIfClickoutsideRef = (e: Event) => {
      if (refElement && !refElement.contains(e.target as Node)) {
        callbackRef.current();
      }
    };

    document.addEventListener('mouseup', executeCallbackIfClickoutsideRef);

    return () => {
      document.removeEventListener('mouseup', executeCallbackIfClickoutsideRef);
    };
  }, [ref, elementRendered]);
};

export default useOnClickOutsideRef;
