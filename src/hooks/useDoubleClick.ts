import { RefObject, useEffect } from 'react';

const useDoubleClick = (
  ref: RefObject<HTMLButtonElement>,
  onSingleClick: () => void,
  onDoubleClick: () => void,
) => {
  useEffect(() => {
    if (ref.current) {
      const clickRef = ref.current;
      const latency = 200;
      let clickCount = 0;
      const handleClick = () => {
        clickCount += 1;

        setTimeout(() => {
          if (clickCount === 1) onSingleClick();
          else if (clickCount === 2) onDoubleClick();
          clickCount = 0;
        }, latency);
      };

      // Add event listener for click events
      clickRef?.addEventListener('click', handleClick);

      // Remove event listener
      return () => {
        clickRef?.removeEventListener('click', handleClick);
      };
    }
  });
};

export default useDoubleClick;
