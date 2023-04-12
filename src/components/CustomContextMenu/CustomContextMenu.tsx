import { ContextMenuType, IContextMenuData } from '@/interfaces/common';
import { useState, useEffect, useRef, useMemo, memo, useCallback } from 'react';
import { ProjectCellMenu } from './ContextMenus/ProjectCellContextMenu';
import useIsInViewPort from '@/hooks/useIsInViewport';
import './styles.css';

const getTranslatedPixels = (dimensions: DOMRectReadOnly) => {
  if (dimensions && dimensions.top > 0) {
    return `-${Math.abs(dimensions.bottom - window.innerHeight) + 20}px`;
  } else if (dimensions) {
    return `${Math.abs(dimensions.top) + 20}px`;
  } else {
    return '0px';
  }
};

interface IContextMenuState extends IContextMenuData {
  isVisible: boolean;
}

/**
 * Listens to the custom 'showContextMenu'-event, which will trigger this components visiblity. The event
 * needs to be given the needed data and renders custom menu's depending on the given ContextMenuType through
 * the event detail property.
 */
const CustomContextMenu = () => {
  const [contextMenuState, setContextMenuState] = useState<IContextMenuState>({
    isVisible: false,
    menuType: ContextMenuType.EDIT_PROJECT_CELL,
    title: '',
    year: 0,
    cellType: 'plan',
    atElement: null as unknown as Element,
  });

  const contextRef = useRef<HTMLDivElement>(null);

  const { isVisible, menuType, title, year, cellType, onRemoveCell, onEditCell, atElement } =
    contextMenuState;

  const { isInViewPort, dimensions } = useIsInViewPort(contextRef);

  const isElementOutOfView = !!(!isInViewPort && dimensions);

  const { left, top } = useMemo(
    () => (atElement ? atElement.getBoundingClientRect() : { left: 0, top: 0 }),
    [atElement],
  );

  console.log('LEFT: ', left);
  console.log('TOP: ', top);
  console.log('dimensions: ', dimensions);
  console.log('atElement: ', atElement);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuState((current) => ({ ...current, isVisible: false }));
  }, []);

  /**
   * Handle context menu visiblity:
   * - Show context menu on 'showContextMenu'-event
   * - Hide context menu on 'scroll'-event
   * - Hide context menu when clicking outside the context menu container
   */
  useEffect(() => {
    if (!contextRef || !contextRef.current) {
      return;
    }

    const contextElement = contextRef.current;

    const closeContextMenuIfClickOutsideMenu = (e: MouseEvent) => {
      if (contextElement && !contextElement.contains(e.target as Node)) {
        handleCloseContextMenu();
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showContextMenu = (e: any) => {
      const { event, ...detail } = e.detail;
      setContextMenuState({
        isVisible: true,
        ...detail,
      });
    };

    contextElement.addEventListener('showContextMenu', showContextMenu);
    document.addEventListener('click', closeContextMenuIfClickOutsideMenu);
    document.addEventListener('scroll', handleCloseContextMenu);
    return () => {
      contextElement.removeEventListener('showContextMenu', showContextMenu);
      document.removeEventListener('click', closeContextMenuIfClickOutsideMenu);
      document.removeEventListener('scroll', handleCloseContextMenu);
    };
  }, [contextRef]);

  return (
    <div
      ref={contextRef}
      id="custom-context-menu"
      className="context-menu-container"
      style={{
        left: left,
        top: top,
        transform: `translate(1.5rem, ${isElementOutOfView && getTranslatedPixels(dimensions)})`,
      }}
    >
      {isVisible && menuType === ContextMenuType.EDIT_PROJECT_CELL && (
        <ProjectCellMenu
          onCloseMenu={handleCloseContextMenu}
          title={title}
          year={year}
          cellType={cellType}
          onRemoveCell={onRemoveCell}
          onEditCell={onEditCell}
        />
      )}
    </div>
  );
};

export default memo(CustomContextMenu);
