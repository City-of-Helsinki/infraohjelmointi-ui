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

const { REACT_APP_AUTHORITY, REACT_APP_CLIENT_ID, REACT_APP_REDIRECT_URI } = process.env;

const oidcConfig = {
  authority: REACT_APP_AUTHORITY ?? '',
  client_id: REACT_APP_CLIENT_ID ?? '',
  redirect_uri: REACT_APP_REDIRECT_URI ?? '',
  scope: 'openid profile',
};

// This callback is needed to remove the login payload from the url in order for silent login (token renewals) to work
const onSigninCallback = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

injectStore(store);

root.render(
  <BrowserRouter>
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback} automaticSilentRenew={true}>
      <Provider store={store}>
        <ConfirmDialogContextProvider>
          <App />
        </ConfirmDialogContextProvider>
      </Provider>
    </AuthProvider>
  </BrowserRouter>,
);
