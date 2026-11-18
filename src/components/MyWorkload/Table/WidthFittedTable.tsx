import { FC, useLayoutEffect, useRef } from 'react';
import { WidthFittedTableProps } from '@/interfaces/myWorkloadInterfaces';
import classes from '../styles.module.css';

const WidthFittedTable: FC<WidthFittedTableProps> = ({ enabled, children }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    const table = content?.querySelector('table');
    if (!enabled || !viewport || !content || !table) {
      return;
    }

    const fitTable = () => {
      const availableWidth = viewport.clientWidth;
      if (availableWidth <= 0) {
        return;
      }

      content.style.width = `${availableWidth}px`;
      const tableWidth = Math.max(availableWidth, table.scrollWidth, table.offsetWidth);
      const scale = Math.min(1, availableWidth / tableWidth);
      content.style.width = `${tableWidth}px`;
      content.style.transform = `scale(${scale})`;
      viewport.style.height = `${Math.ceil(content.offsetHeight * scale)}px`;
    };

    fitTable();
    const observer = new ResizeObserver(fitTable);
    observer.observe(viewport);
    observer.observe(table);
    window.addEventListener('resize', fitTable);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fitTable);
      content.style.width = '';
      content.style.transform = '';
      viewport.style.height = '';
    };
  }, [enabled, children]);

  return (
    <div
      ref={viewportRef}
      className={enabled ? classes.fitTableViewport : undefined}
      data-testid="my-workload-table-viewport"
    >
      <div
        ref={contentRef}
        className={classes.fitTableContent}
        data-testid="my-workload-table-content"
      >
        {children}
      </div>
    </div>
  );
};

export default WidthFittedTable;
