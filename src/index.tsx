import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupStore } from '@/store';
import { AuthProvider } from 'react-oidc-context';
import 'hds-core';
import './index.css';
import './i18n';

import App from '@/App';
import { injectStore } from '@/utils/interceptors';
import ConfirmDialogContextProvider from './components/context/ConfirmDialogContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const store = setupStore();

const oidcConfig = {
  authority: 'https://tunnistus.test.hel.ninja/auth/realms/helsinki-tunnistus',
  client_id: 'infraohjelmointi-ui-dev',
  redirect_uri: 'http://localhost:4000/auth/helsinki/return',
};

injectStore(store);

root.render(
  <BrowserRouter>
    <AuthProvider {...oidcConfig}>
      <Provider store={store}>
        <ConfirmDialogContextProvider>
          <App />
        </ConfirmDialogContextProvider>
      </Provider>
    </AuthProvider>
  </BrowserRouter>,
);
