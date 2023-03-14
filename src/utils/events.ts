import { IContextMenuData } from '@/interfaces/common';
import { MouseEvent } from 'react';

export const dispatchContextMenuEvent = (e: MouseEvent<HTMLElement>, data: IContextMenuData) => {
  e.preventDefault();
  document.getElementById('custom-context-menu')?.dispatchEvent(
    new CustomEvent('showContextMenu', {
      detail: {
        event: e,
        ...data,
      },
    }),
  );
};
