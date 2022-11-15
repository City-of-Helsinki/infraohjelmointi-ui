# Infraohjelmointi UI

- [Infraohjelmointi UI](#infraohjelmointi-ui)
    - [Setup](#setup)
    - [Serving the application](#serving-the-application)
        - [Webpack](#webpack)
        - [Babel](#babel)
    - [Formatting and validation](#formatting-and-validation)
        - [ESLint](#eslint)
        - [Prettier](#prettier)
    - [State and storage](#state-and-storage)
    - [Routing](#routing)
    - [Testing](#testing)
    - [Localization](#localization)
    - [Collection of scripts](#collection-of-scripts)

### Setup

1. `npm run create-env` to create your own development and production .env files
2. `yarn install`
3. `npm start`

### Serving the application

- To serve the application run `npm run`
- To build the application run `npm run build`

##### Webpack

We use [webpack](https://webpack.js.org/) for bundling, building and serving the application in development and production.

There are two sepparate [configuration files](https://webpack.js.org/configuration/) in the project root folder for webpack, `webpack.dev.config.js` for development and `webpack.prod.config.js` for production.

##### Babel

[Babel](https://babeljs.io/) is used as the complier to convert our source code to older versions of JavaScript. The [configuration file](https://babeljs.io/docs/en/config-files), `.babelrc.json` can be found in the project root folder.

### Formatting and validation

- To format the application with prettier: `npm run format`
- To check for linting errors: `npm run lint`
- To check **and fix** linting errors: `npm run lint:fix`

##### ESLint

We use [ESLint](https://eslint.org/) to validate the pattern and validity of the source code. The [rules and configurations](https://eslint.org/docs/latest/user-guide/configuring/configuration-files) for ESLint are defined in `.eslintrc.json`, which can be found in the project root folder.

##### Prettier

We use [Prettier](https://prettier.io/) for code formatting. The [rules and configurations](https://prettier.io/docs/en/configuration.html) are defined in `.prettierrc.json`, which can be found in the project root folder.

If using VS Code, download the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) plugin and make sure that you have Prettier as the default formatter enabled in the settings.json. Formatting the code on save is also recommended, but not necessary.

```
{
  // Prettier as default formatter
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  // Format code on save
  "editor.formatOnSave": true,
}
```

### State and storage

The application state is managed by [React-Redux](https://react-redux.js.org/) and uses the built-in [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started), for managing the state.

The built-in hooks (useSelector and useDispatch) have been typed to our own store, so make sure to use `useAppDispatch` and `useAppSelector` instead when calling the store.

### Routing

We use [react-router v6](https://reactrouter.com/en/main/start/overview) for routing.

We create the whole hierarchy-tree of routes in `index.tsx`, using the new `createBrowserRouter` which is recommended since v6.

### Testing

- Run all tests: `npm test`
- For running specific tests use the same command and specify a file i.e: `npm test App.test.tsx`

This project uses [jest](https://jestjs.io/docs/tutorial-react) and [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/) for unit testing. There is also a `test-utils.tsx` file where a `renderWithProviders()` function is created to help wrap the component being tested with the redux-store Provider, [more about redux and RTL](https://redux.js.org/usage/writing-tests).

### Localization

We use i18next-react for localization. You can find the localization files under `/src/i18n/*`.

> **_NOTE:_** Localization will not be included in the MVP version of the app. The app will only be using the constants from `fi.json` until the full release.

### Collection of scripts

- **Install packages** : `yarn install`
- **Serve the application**: `npm run`
- **Build the application**: `npm run build`
- **Format the application with prettier**: `npm run format`
- **Lint**: `npm run lint`
- **Lint and fix linting errors**: `npm run lint:fix`
- **Run all tests**: `npm test`
- **Run specific test** i.e App: `npm test App.test.tsx`
