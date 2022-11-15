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
import { ProjectCardBasics, ProjectCardTasks } from '@/components/ProjectCard';
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
            element: <ProjectCardBasics />,
          },
          {
            path: 'tasks',
            element: <ProjectCardTasks />,
          },
        ],
      },
    ],
  },
]);

root.render(<RouterProvider router={router} />);
