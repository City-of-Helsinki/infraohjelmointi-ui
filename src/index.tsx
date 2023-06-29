import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupStore } from '@/store';
import 'hds-core';
import './index.css';
import './i18n';

import App from '@/App';
import { injectStore } from '@/utils/interceptors';
import ConfirmDialogContextProvider from './components/context/ConfirmDialogContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const store = setupStore();
injectStore(store);

root.render(
  <BrowserRouter>
    <Provider store={store}>
      <ConfirmDialogContextProvider>
        <App />
      </ConfirmDialogContextProvider>
    </Provider>
  </BrowserRouter>,
);
