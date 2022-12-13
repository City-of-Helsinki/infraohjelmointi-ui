import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupStore } from '@/store';
import './index.css';
import './i18n';

import App from '@/App';
import ProjectCardView from '@/views/ProjectCardView';
import { ProjectCardBasics } from '@/components/ProjectCard';
import ErrorView from '@/views/ErrorView';
import AuthGuard from '@/components/AuthGuard';
import { injectStore } from '@/utils/interceptors';
import PlanningListView from '@/views/PlanningListView';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const store = setupStore();
injectStore(store);

/**
 * Browser router for the application
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Provider store={store}>
        <AuthGuard />
        <App />
      </Provider>
    ),
    errorElement: <ErrorView />,
    children: [
      {
        path: 'project-card/:projectId',
        element: <ProjectCardView />,
        children: [
          {
            path: 'basics',
            element: <ProjectCardBasics />,
          },
        ],
      },
      {
        path: 'planning-list',
        element: <PlanningListView />,
      },
    ],
  },
]);

root.render(<RouterProvider router={router} />);
