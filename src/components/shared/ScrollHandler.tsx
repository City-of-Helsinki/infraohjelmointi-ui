import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RETRY_AMOUNT = 20;

const ScrollHandler = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top of the page for project basics form
    if (pathname.includes('/project/')) {
      console.log('pathname is project, setting localstorage: ', window.scrollY);

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

      console.log('scrollY: ', scrollY);

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
        // If 100 x 20
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
  }, [pathname]);

  return null;
};

export default ScrollHandler;
