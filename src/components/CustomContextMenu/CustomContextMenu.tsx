import { ContextMenuType, IContextMenuData } from '@/interfaces/common';
import { useState, useEffect, useRef, useLayoutEffect, useMemo, memo, useCallback } from 'react';
import { ProjectCellMenu } from './ContextMenus/ProjectCellContextMenu';
import { ProjectPhaseMenu } from './ContextMenus/ProjectPhaseContextMenu';
import './styles.css';

interface IContextMenuState extends IContextMenuData {
  isVisible: boolean;
  firstClick: boolean;
  posX: number;
  posY: number;
}

const initialState = {
  isVisible: false,
  firstClick: true,
  posX: 0,
  posY: 0,
  menuType: ContextMenuType.EDIT_PROJECT_CELL,
};

/**
 * Listens to the custom 'showContextMenu'-event, which will trigger this components visiblity. The event
 * needs to be given the needed data and renders custom menu's depending on the given ContextMenuType through
 * the event detail property.
 *
 * This menu should either by used with onMouseDown or onContextMenu, since onClick will mess with the
 * eventlisteners that hides this component.
 */
const CustomContextMenu = () => {
  const [contextMenuState, setContextMenuState] = useState<IContextMenuState>(initialState);

  const { isVisible, posX, posY, menuType, cellMenuProps, phaseMenuProps, firstClick } =
    contextMenuState;

  const contextMenuRef = useRef<HTMLDivElement>(null);

  const menuPosition = useMemo(
    () => ({
      left: posX,
      top: posY,
    }),
    [posX, posY],
  );

  const resetContextMenu = useCallback(() => {
    setContextMenuState(initialState);
  }, []);

  /**
   * Listens to events and handle context menu visiblity:
   * - Show context menu on 'showContextMenu'-event
   * - Hide context menu on 'scroll'-event
   * - Hide context menu on 'mouseup'-event when clicking outside the context menu container
   */
  useEffect(() => {
    if (!contextMenuRef || !contextMenuRef.current) {
      return;
    }

    const closeContextMenuOnScroll = () => {
      resetContextMenu();
    };

    const contextElement = contextMenuRef.current;

    const closeContextMenuOnClickOutsideRef = (e: MouseEvent) => {
      // We don't want to close the menu if it's the first click (i.e. the click that opened the menu)
      if (firstClick) {
        setContextMenuState((current) => ({ ...current, firstClick: false }));
      } else {
        if (contextElement && !contextElement.contains(e.target as Node)) {
          resetContextMenu();
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showContextMenu = (e: any) => {
      const { event, ...detail } = e.detail;
      setContextMenuState({
        ...initialState,
        ...detail,
        isVisible: true,
        posX: event.clientX,
        posY: event.clientY,
      });
    };

    contextElement.addEventListener('showContextMenu', showContextMenu);
    document.addEventListener('mouseup', closeContextMenuOnClickOutsideRef);
    document.addEventListener('scroll', closeContextMenuOnScroll);
    return () => {
      contextElement.removeEventListener('showContextMenu', showContextMenu);
      document.removeEventListener('mouseup', closeContextMenuOnClickOutsideRef);
      document.removeEventListener('scroll', closeContextMenuOnScroll);
    };
  }, [contextMenuRef, cellMenuProps, firstClick, resetContextMenu]);

  // Check if the context menu position overflows the viewport and move it into the viewport
  useLayoutEffect(() => {
    if (contextMenuRef && contextMenuRef.current) {
      // If the context menu overflows the windows x-axis, move it into the viewport
      if (posX + contextMenuRef.current.offsetWidth > window.innerWidth) {
        setContextMenuState((current) => ({
          ...current,
          posX: posX - (contextMenuRef.current?.offsetWidth || 0),
        }));
      }
      // If the context menu overflows the windows y-axis, move it into the viewport
      if (posY + contextMenuRef.current.offsetHeight > window.innerHeight) {
        setContextMenuState((current) => ({
          ...current,
          posY: posY - (contextMenuRef.current?.offsetHeight || 0),
        }));
      }
    }
  }, [posX, posY]);

  const renderMenu = useCallback(() => {
    if (isVisible) {
      switch (menuType) {
        case ContextMenuType.EDIT_PROJECT_CELL:
          if (cellMenuProps) {
            return <ProjectCellMenu onCloseMenu={resetContextMenu} {...cellMenuProps} />;
          }
          break;
        case ContextMenuType.EDIT_PROJECT_PHASE:
          if (phaseMenuProps) {
            return <ProjectPhaseMenu onCloseMenu={resetContextMenu} {...phaseMenuProps} />;
          }
          break;
      }
    }
  }, [cellMenuProps, resetContextMenu, isVisible, menuType, phaseMenuProps]);

  return (
    <div
      ref={contextMenuRef}
      id="custom-context-menu"
      className="context-menu-container"
      style={menuPosition}
    >
      {renderMenu()}
    </div>
  );
};

export default memo(CustomContextMenu);
