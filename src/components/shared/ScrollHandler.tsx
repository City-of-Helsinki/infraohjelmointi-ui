import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RETRY_AMOUNT = 20;
const PLANNING_PATH = '/planning/';
const PROJECT_CARD_PATH = '/project/';

const ScrollHandler = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // If there's a search param we don't want to modify the scrolling
    if (search && pathname.includes(PLANNING_PATH)) {
      return;
    }
    // Scroll to top of the page for project basics form
    if (pathname.includes(PROJECT_CARD_PATH)) {
      localStorage.setItem(
        'previousScrollPosition',
        JSON.stringify({ scrollY: window.scrollY ?? '0', scrollX: window.scrollX ?? '0' }),
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
    // Scroll to previous position for other path changes
    else {
      const { scrollY, scrollX } = JSON.parse(
        localStorage.getItem('previousScrollPosition') ?? '{}',
      );

      if (!scrollY) {
        return;
      }

      const interval = setInterval((i) => {
        const scrollHeight = document.body.scrollHeight;

        // Wait for the doc to load its height to at least the scroll height and the clear the interval
        if (scrollHeight >= scrollY) {
          clearInterval(interval);
          window.localStorage.removeItem('previousScrollPosition');
          window.scrollTo({
            top: scrollY,
            left: scrollX,
            behavior: 'auto',
          });
        }
        // Clear the intreval if it runs over the max amount of times to prevent an infinite loop
        else if (i > RETRY_AMOUNT) {
          clearInterval(interval);
          window.localStorage.removeItem('previousScrollPosition');
          window.scrollTo({
            top: scrollHeight,
            left: 0,
            behavior: 'auto',
          });
        }
      }, 100);
    }
  }, [pathname, search]);

  return null;
};

export default ScrollHandler;
