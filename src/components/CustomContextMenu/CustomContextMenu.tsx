import { ContextMenuType, IContextMenuData } from '@/interfaces/common';
import { useState, useEffect, useRef, useLayoutEffect, useMemo, memo, useCallback } from 'react';
import { ProjectCellMenu } from './ContextMenus/ProjectCellContextMenu';
import './styles.css';

interface IContextMenuState extends IContextMenuData {
  isVisible: boolean;
  posX: number;
  posY: number;
}

/**
 * Listens to the custom 'showContextMenu'-event, which will trigger this components visiblity. The event
 * needs to be given the needed data and renders custom menu's depending on the given ContextMenuType through
 * the event detail property.
 */
const CustomContextMenu = () => {
  const [contextMenuState, setContextMenuState] = useState<IContextMenuState>({
    isVisible: false,
    posX: 0,
    posY: 0,
    menuType: ContextMenuType.EDIT_PROJECT_CELL,
    title: '',
    year: 0,
    cellType: 'plan',
  });

  const { isVisible, posX, posY, menuType, title, year, cellType, onRemoveCell, onEditCell } =
    contextMenuState;

  const contextRef = useRef<HTMLDivElement>(null);

  const menuPosition = useMemo(
    () => ({
      left: posX,
      top: posY,
    }),
    [posX, posY],
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuState((current) => ({ ...current, isVisible: false }));
  }, []);

  /**
   * Listens to events and handle context menu visiblity:
   * - Show context menu on 'showContextMenu'-event
   * - Hide context menu on 'scroll'-event
   * - Hide context menu when clicking outside the context menu container
   */
  useEffect(() => {
    if (!contextRef || !contextRef.current) {
      return;
    }

    const closeContextMenuOnScroll = () => {
      handleCloseContextMenu();
    };

    const contextElement = contextRef.current;

    const closeContextMenuOnClickOutsideRef = (e: MouseEvent) => {
      if (contextElement && !contextElement.contains(e.target as Node)) {
        handleCloseContextMenu();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showContextMenuOnEvent = (e: any) => {
      const { event, ...detail } = e.detail;

      setContextMenuState({
        isVisible: true,
        posX: event.clientX,
        posY: event.clientY,
        ...detail,
      });
    };

    contextElement.addEventListener('showContextMenu', showContextMenuOnEvent);
    document.addEventListener('click', closeContextMenuOnClickOutsideRef);
    document.addEventListener('scroll', closeContextMenuOnScroll);
    return () => {
      contextElement.removeEventListener('showContextMenu', showContextMenuOnEvent);
      document.removeEventListener('click', closeContextMenuOnClickOutsideRef);
      document.removeEventListener('scroll', closeContextMenuOnScroll);
    };
  }, [contextRef]);

  // Check if the context menu position overflows the viewport and move it into the viewport
  useLayoutEffect(() => {
    if (contextRef && contextRef.current) {
      // If the context menu overflows the windows x-axis, move it into the viewport
      if (posX + contextRef.current.offsetWidth > window.innerWidth) {
        setContextMenuState((current) => ({
          ...current,
          posX: posX - (contextRef.current?.offsetWidth || 0),
        }));
      }
      // If the context menu overflows the windows y-axis, move it into the viewport
      if (posY + contextRef.current.offsetHeight > window.innerHeight) {
        setContextMenuState((current) => ({
          ...current,
          posY: posY - (contextRef.current?.offsetHeight || 0),
        }));
      }
    }
  }, [posX, posY]);

  const renderMenu = useCallback(() => {
    if (isVisible) {
      switch (menuType) {
        case ContextMenuType.EDIT_PROJECT_CELL:
          return (
            <ProjectCellMenu
              onCloseMenu={handleCloseContextMenu}
              title={title}
              year={year}
              cellType={cellType}
              onRemoveCell={onRemoveCell}
              onEditCell={onEditCell}
            />
          );
        case ContextMenuType.EDIT_PROJECT_PHASE:
          return null;
        default:
          return null;
      }
    }
  }, [
    cellType,
    handleCloseContextMenu,
    isVisible,
    menuType,
    onEditCell,
    onRemoveCell,
    title,
    year,
  ]);

  return (
    <div
      ref={contextRef}
      id="custom-context-menu"
      className="context-menu-container"
      style={menuPosition}
    >
      {renderMenu()}
    </div>
  );
};

export default memo(CustomContextMenu);
