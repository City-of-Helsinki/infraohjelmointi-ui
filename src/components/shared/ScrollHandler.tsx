import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RETRY_AMOUNT = 20;

const ScrollHandler = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    localStorage.setItem(
      'previousScrollPosition',
      JSON.stringify({ scrollY: window.scrollY ?? '0', scrollX: window.scrollX ?? '0' }),
    );

    // Scroll to top of the page for project basics form
    if (pathname.includes('/project/')) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      });
    }
    // Scroll to previous position for other path changes
    else {
      const previousScrollPosition = JSON.parse(
        localStorage.getItem('previousScrollPosition') ?? '{}',
      );
      const interval = setInterval((i) => {
        const scrollHeight = document.body.scrollHeight;
        // Wait for the doc to load its height to at least the scroll height and the clear the interval
        if (scrollHeight >= previousScrollPosition.scrollY) {
          clearInterval(interval);
          window.localStorage.removeItem('previousScrollPosition');
          window.scrollTo({
            top: previousScrollPosition.scrollY,
            left: previousScrollPosition.scrollX,
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
