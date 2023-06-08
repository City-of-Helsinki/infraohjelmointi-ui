import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const RETRY_AMOUNT = 20;
const PLANNING_PATH = '/planning/';
const PROJECT_CARD_PATH = '/project/';

const STORAGE_ITEM = 'previousScrollPosition';

const scrollTo = (x: number, y: number) => {
  window.scrollTo({
    top: y,
    left: x,
    behavior: 'smooth',
  });
};

const ScrollHandler = () => {
  const location = useLocation();
  const { pathname, search } = location;
  const clicked = useRef(false);

  useEffect(() => {
    const onWindowScroll = () => {
      if (window.location.pathname.includes(PROJECT_CARD_PATH) || clicked.current) {
        return;
      }
      localStorage.setItem(
        STORAGE_ITEM,
        JSON.stringify({ scrollY: window.scrollY ?? '0', scrollX: window.scrollX ?? '0' }),
      );
    };

    const onClick = () => {
      clicked.current = true;
      if (window.location.pathname.includes(PROJECT_CARD_PATH)) {
        return;
      }
      localStorage.setItem(
        STORAGE_ITEM,
        JSON.stringify({ scrollY: window.scrollY ?? '0', scrollX: window.scrollX ?? '0' }),
      );
    };

    window.addEventListener('scroll', onWindowScroll);
    window.addEventListener('mousedown', onClick);

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener('mousedown', onClick);
    };
  }, []);

  useEffect(() => {
    // If there's a search param we don't want to modify the scrolling
    if (search && pathname.includes(PLANNING_PATH)) {
      console.log('contains search and in planning list, returning');
      return;
    }
    // Scroll to top of the page for project basics form
    if (pathname.includes(PROJECT_CARD_PATH)) {
      scrollTo(0, 0);
    }
    // Scroll to previous position for other path changes
    else {
      const { scrollY, scrollX } = JSON.parse(localStorage.getItem(STORAGE_ITEM) ?? '{}');

      if (!scrollY) {
        return;
      }

      window.localStorage.removeItem(STORAGE_ITEM);
      clicked.current = false;

      const interval = setInterval((i) => {
        const scrollHeight = document.body.scrollHeight;

        // Wait for the doc to load its height to at least the scroll height and the clear the interval
        if (scrollHeight >= scrollY) {
          clearInterval(interval);
          scrollTo(scrollX, scrollY);
        }
        // Clear the intreval if it runs over the max amount of times to prevent an infinite loop
        else if (i > RETRY_AMOUNT) {
          clearInterval(interval);
          scrollTo(0, scrollHeight);
        }
      }, 100);
    }
  }, [pathname, search]);

  return null;
};

export default ScrollHandler;
