import { IContextMenuData } from '@/interfaces/common';
import { MouseEvent } from 'react';

const { REACT_APP_API_URL } = process.env;

export const dispatchContextMenuEvent = (
  e: MouseEvent<HTMLElement | SVGElement>,
  data: IContextMenuData,
) => {
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

export const eventSource = new EventSource(`${REACT_APP_API_URL}/events/`);
