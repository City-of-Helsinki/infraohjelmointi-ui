import { useEffect, RefObject } from 'react';

/**
 * Detect clicks outside of a given ref element and fire a given callback function.
 *
 * @param ref ref to any element, add element types as needed to the param typing
 * @param callback function callback to trigger after the user clicks outside
 */
const useClickOutsideRef = (ref: RefObject<HTMLDivElement>, callback: () => unknown) => {
  useEffect(() => {
    // Function that triggers when user clicks outside of ref
    const handleClickOutside = ({ target }: MouseEvent) => {
      if (ref.current && !ref.current.contains(target as Node)) {
        callback();
      }
    };
    document.addEventListener('mouseup', handleClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);
    return () => {
      // Event listener needs to be removed on cleanup
      document.removeEventListener('mouseup', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [ref]);
};

export default useClickOutsideRef;
