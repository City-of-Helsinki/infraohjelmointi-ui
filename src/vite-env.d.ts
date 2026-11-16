/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_API_URL?: string;
  readonly REACT_APP_AUTHORITY?: string;
  readonly REACT_APP_CLIENT_ID?: string;
  readonly REACT_APP_REDIRECT_URI?: string;
  readonly REACT_APP_API_ID?: string;
  readonly REACT_APP_API_TOKEN_GRANT_TYPE?: string;
  readonly REACT_APP_OPEN_ID_CONFIG?: string;
  readonly REACT_APP_MAINTENANCE_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'hds-core';
declare module 'moment/locale/fi';
