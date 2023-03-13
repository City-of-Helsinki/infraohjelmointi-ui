import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { ProjectCellContextMenu } from './ContextMenus';
import './styles.css';

const CustomContextMenu = ({ targetId }: { targetId: string }) => {
  const [contextMenuState, setContextMenuState] = useState({
    isVisible: false,
    posX: 0,
    posY: 0,
  });

  const { isVisible, posX, posY } = contextMenuState;

  const contextRef = useRef<HTMLDivElement>(null);

  const menuPosition = useMemo(
    () => ({
      left: posX,
      top: posY,
    }),
    [posX, posY],
  );

  const handleCloseContextMenu = () => {
    setContextMenuState((current) => ({ ...current, isVisible: false }));
  };

  useEffect(() => {
    const closeContextMenu = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        handleCloseContextMenu();
      }
    };

    const showContextMenu = (e: MouseEvent) => {
      const targetElement = document.getElementById(targetId);
      if (targetElement && targetElement.contains(e.target as Node)) {
        e.preventDefault();
        setContextMenuState({
          isVisible: true,
          posX: e.clientX,
          posY: e.clientY,
        });
      } else {
        closeContextMenu(e);
      }
    };

    document.addEventListener('contextmenu', showContextMenu);
    document.addEventListener('click', closeContextMenu);
    return () => {
      document.removeEventListener('contextmenu', showContextMenu);
      document.removeEventListener('click', closeContextMenu);
    };
  }, [contextMenuState, targetId]);

  // Check if the context menu position overflows the viewport and move it into the viewport
  useLayoutEffect(() => {
    if (contextRef && contextRef.current) {
      if (posX + contextRef.current.offsetWidth > window.innerWidth) {
        setContextMenuState((current) => ({
          ...current,
          posX: posX - (contextRef.current?.offsetWidth || 0),
        }));
      }
      if (posY + contextRef.current.offsetHeight > window.innerHeight) {
        setContextMenuState((current) => ({
          ...current,
          posY: posY - (contextRef.current?.offsetHeight || 0),
        }));
      }
    }
  }, [posX, posY]);

  return (
    <div ref={contextRef} className="context-menu-container" style={menuPosition}>
      {isVisible && <ProjectCellContextMenu handleCloseContextMenu={handleCloseContextMenu} />}
    </div>
  );
};

export default CustomContextMenu;
