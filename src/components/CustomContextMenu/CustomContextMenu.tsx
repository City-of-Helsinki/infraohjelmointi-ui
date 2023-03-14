import { ContextMenuType, IContextMenuData } from '@/interfaces/common';
import { IProject } from '@/interfaces/projectInterfaces';
import { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { ProjectCellMenu } from './ContextMenus/ProjectCellMenu';
import './styles.css';

interface IContextMenuState extends IContextMenuData {
  isVisible: boolean;
  posX: number;
  posY: number;
}

const CustomContextMenu = () => {
  const [contextMenuState, setContextMenuState] = useState<IContextMenuState>({
    isVisible: false,
    posX: 0,
    posY: 0,
    menuType: ContextMenuType.EDIT_PROJECT_CELL,
    project: {} as IProject,
    year: 0,
    cellType: 'planning',
    objectKey: '',
  });

  const { isVisible, posX, posY, menuType, project, year, cellType, objectKey } = contextMenuState;

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
    if (!contextRef || !contextRef.current) {
      return;
    }

    const closeContextMenu = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        handleCloseContextMenu();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showContextMenu = (e: any) => {
      const { event, ...detail } = e.detail;
      setContextMenuState({
        isVisible: true,
        posX: event.pageX,
        posY: event.pageY,
        ...detail,
      });
    };

    contextRef.current.addEventListener('showContextMenu', showContextMenu);
    document.addEventListener('click', closeContextMenu);
    return () => {
      contextRef.current?.removeEventListener('showContextMenu', showContextMenu);
      document.removeEventListener('click', closeContextMenu);
    };
  }, [contextRef]);

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
          // TODO: posY: posY - (contextRef.current?.offsetHeight || 0),
        }));
      }
    }
  }, [posX, posY]);

  return (
    <div
      ref={contextRef}
      id="custom-context-menu"
      className="context-menu-container"
      style={menuPosition}
    >
      {isVisible && menuType === ContextMenuType.EDIT_PROJECT_CELL && (
        <ProjectCellMenu
          handleCloseMenu={handleCloseContextMenu}
          project={project}
          year={year}
          cellType={cellType}
          objectKey={objectKey}
        />
      )}
    </div>
  );
};

export default CustomContextMenu;
