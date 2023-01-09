import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupStore } from '@/store';
import './index.css';
import './i18n';

import App from '@/App';
import ProjectView from '@/views/ProjectView';
import { ProjectBasics } from '@/components/Project/ProjectBasics';
import ErrorView from '@/views/ErrorView';
import AuthGuard from '@/components/AuthGuard';
import { injectStore } from '@/utils/interceptors';
import PlanningView from '@/views/PlanningView';
import { ProjectNotes } from './components/Project/ProjectNotes';

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
        path: 'project/:projectId',
        element: <ProjectView />,
        children: [
          {
            path: 'basics',
            element: <ProjectBasics />,
          },
          { path: 'notes', element: <ProjectNotes /> },
        ],
      },
      {
        path: 'planning',
        children: [
          {
            path: 'planner',
            element: <PlanningView />,
          },
          {
            path: 'coordinator',
            element: <PlanningView />,
          },
        ],
      },
    ],
  },
]);

root.render(<RouterProvider router={router} />);
