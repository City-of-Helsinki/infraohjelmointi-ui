import { useEffect, RefObject } from 'react';

/**
 * Detect clicks outside of a given ref element and fire a given callback function.
 *
 * @param ref ref to any element
 * @param callback function callback to trigger after the user clicks outside
 */
const useClickOutsideRef = <T extends HTMLElement>(ref: RefObject<T>, callback: () => unknown) => {
  useEffect(() => {
    const handleClickOutside = ({ target }: MouseEvent) => {
      if (ref.current && !ref.current.contains(target as Node)) {
        callback();
      }
    };
    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [callback, ref]);
};

export default useClickOutsideRef;