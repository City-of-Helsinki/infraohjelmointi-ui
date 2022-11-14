import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupStore } from '@/store';
import './index.css';
import 'hds-core';
import './i18n';

import App from '@/App';
import ProjectCardView from '@/views/ProjectCardView';
import ProjectCardBasicsView from '@/views/ProjectCardBasicsView';
import ProjectCardTasksView from '@/views/ProjectCardTasksView';
import ErrorView from '@/views/ErrorView';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const store = setupStore();

/**
 * Browser router for the application
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Provider store={store}>
        <App />
      </Provider>
    ),
    errorElement: <ErrorView />,
    children: [
      {
        path: 'project-card',
        element: <ProjectCardView />,
        children: [
          {
            path: 'basics',
            element: <ProjectCardBasicsView />,
          },
          {
            path: 'tasks',
            element: <ProjectCardTasksView />,
          },
        ],
      },
    ],
  },
]);

root.render(<RouterProvider router={router} />);
