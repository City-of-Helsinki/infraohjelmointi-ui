# Infraohjelmointi UI

- [Infraohjelmointi UI](#infraohjelmointi-ui)
    - [Setup](#setup)
    - [Serving the application](#serving-the-application)
    - [Formatting and validation](#formatting-and-validation)
        - [ESLint](#eslint)
        - [Prettier](#prettier)
    - [Ways of working](#ways-of-working)
        - [Commits](#commits)
        - [Hotfixes](#hotfixes)
        - [Merges](#merges)
    - [State and storage](#state-and-storage)
    - [Routing](#routing)
    - [Testing](#testing)
    - [Localization](#localization)
    - [Collection of scripts](#collection-of-scripts)

### Setup

1. `yarn run create-env` to create your own development and production .env files
2. `yarn install`
3. `yarn start`

### Serving the application

- To serve the application run `yarn run`
- To build the application run `yarn run build`

### Formatting and validation

- To format the application with prettier: `yarn run format`
- To check for linting errors: `yarn run lint`
- To check **and fix** linting errors: `yarn run lint:fix`

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

### Ways of working
##### Commits

To make our commits more informative those should be written in a format of Conventional Commits i.e. a suitable prefix should be added in the beginning
of every commit e.g. **feat:** built a notification or **refactor**:... etc. The Conventional Commits could be properly configured to the project in the future.

##### Hotfixes

Hotfixes should be done by creating a hotfix branch out of main and then merge that to main and develop to avoid doing any rebases.

##### Merges

The common way of merging branches is using normal merges i.e. not using squash merging unless there is a situation when squashing should be done.

### State and storage

The application state is managed by [React-Redux](https://react-redux.js.org/) and uses the built-in [Redux Toolkit](https://redux-toolkit.js.org/introduction/getting-started), for managing the state.

The built-in hooks (useSelector and useDispatch) have been typed to our own store, so make sure to use `useAppDispatch` and `useAppSelector` instead when calling the store.

### Routing

We use [react-router v6](https://reactrouter.com/en/main/start/overview) for routing.

We create the whole hierarchy-tree of routes in `index.tsx`, using the new `createBrowserRouter` which is recommended since v6.

### Testing

- Run all tests: `yarn test`
- For running specific tests use the same command and specify a file i.e: `yarn test App.test.tsx`

This project uses [jest](https://jestjs.io/docs/tutorial-react) and [React Testing Library (RTL)](https://testing-library.com/docs/react-testing-library/intro/) for unit testing. There is also a `test-utils.tsx` file where a `renderWithProviders()` function is created to help wrap the component being tested with the redux-store Provider, [more about redux and RTL](https://redux.js.org/usage/writing-tests).

### Localization

We use i18next-react for localization. You can find the localization files under `/src/i18n/*`.

> **_NOTE:_** Localization will not be included in the MVP version of the app. The app will only be using the constants from `fi.json` until the full release.

### How to: production release

1. Create a release PR from develop to main
2. Wait for the PR pipeline to run and check that all checks pass
3. Merge the PR
4. Trigger build-infraohjelmointi-ui-stageprod pipeline in azure
5. Approve pipeline run in azure. Deploy pipelines are triggered by the build pipeline but prod deploy needs to be approved separately (=2 approvals in total). To approve, open the pipeline run you want to approve (from menu, select pipelines, then select the correct pipeline and then select the run you need to approve) and there should be a button to approve it (pipeline run is paused until you approve).

### Adding env variables for UI
New env variables need to be added to azure env variable library. Both adding and changing values of the variables requires building the corresponding environment (deploying again isn't enough). Here's instructions on how to add variables.

1. Add the new variable to azure devops library for all environments correctly (they are under Pipelines -> Library)
2. Create a new branch in azure (Repos -> Branches)
3. Add the new variable to the list of variables in /devops/infraohjelmointi-ui-build-config.yml
4. Commit changes to your branch
5. Make a PR from your branch to master and add reviewers (someone from the dev team)
6. Ask them to approve and then merge the PR

Remember to also add the new variable to 1PW!

### Collection of scripts

- **Install packages** : `yarn install`
- **Serve the application**: `yarn start`
- **Build the application**: `yarn run build`
- **Format the application with prettier**: `yarn run format`
- **Lint**: `yarn run lint`
- **Lint and fix linting errors**: `yarn run lint:fix`
- **Run all tests**: `yarn test`
- **Run specific test** i.e App: `yarn test App.test.tsx`
