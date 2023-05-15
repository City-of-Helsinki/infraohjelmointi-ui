import {
  IContextMenuData,
  IFinanceEventData,
  IProjectEventData,
} from '@/interfaces/eventInterfaces';
import { setFinanceUpdate, setProjectUpdate } from '@/reducers/eventsSlice';
import { Dispatch } from '@reduxjs/toolkit';
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

export const addFinanceUpdateEventListener = (dispatch: Dispatch) => {
  const financeUpdate = (event: MessageEvent) => {
    const financeData = JSON.parse(event.data) as IFinanceEventData;
    dispatch(setFinanceUpdate(financeData));
  };
  eventSource.addEventListener('finance-update', financeUpdate);
};

export const removeFinanceUpdateEventListener = (dispatch: Dispatch) => {
  const financeUpdate = (event: MessageEvent) => {
    const financeData = JSON.parse(event.data) as IFinanceEventData;
    dispatch(setFinanceUpdate(financeData));
  };
  eventSource.removeEventListener('finance-update', financeUpdate);
};

export const addProjectUpdateEventListener = (dispatch: Dispatch) => {
  const projectUpdate = (event: MessageEvent) => {
    const projectData = JSON.parse(event.data) as IProjectEventData;
    dispatch(setProjectUpdate(projectData));
  };
  eventSource.addEventListener('project-update', projectUpdate);
};

export const removeProjectUpdateEventListener = (dispatch: Dispatch) => {
  const projectUpdate = (event: MessageEvent) => {
    const projectData = JSON.parse(event.data) as IProjectEventData;
    dispatch(setProjectUpdate(projectData));
  };
  eventSource.removeEventListener('project-update', projectUpdate);
};
