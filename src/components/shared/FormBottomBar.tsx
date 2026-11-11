import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import styles from './FormBottomBar.module.css';

interface FormBottomBarProps {
  children: ReactNode;
  containerClassName?: string;
}

function FormBottomBar({ children, containerClassName = '' }: Readonly<FormBottomBarProps>) {
  const barRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      setHeight(bar.offsetHeight);
      // Lets fixed/sticky elements elsewhere (e.g. the side panel) avoid the bar
      root.style.setProperty('--form-bottom-bar-height', `${bar.offsetHeight}px`);
    });
    observer.observe(bar);
    return function cleanup() {
      observer.disconnect();
      root.style.removeProperty('--form-bottom-bar-height');
    };
  }, []);

  return (
    <>
      {/* In-flow placeholder matching the fixed bar's height so it never covers page content */}
      <div aria-hidden="true" style={{ height }} />
      <div ref={barRef} className={styles.bar} data-testid="form-bottom-bar">
        <div className={`${styles.container} ${containerClassName}`}>{children}</div>
      </div>
    </>
  );
}

export default FormBottomBar;
