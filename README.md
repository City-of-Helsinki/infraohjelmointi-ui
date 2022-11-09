# infraohjelmointi-ui

- [infraohjelmointi-ui](#infraohjelmointi-ui)
    - [Serving the application](#serving-the-application)
        - [Webpack](#webpack)
        - [Babel](#babel)
    - [Formatting and validation](#formatting-and-validation)
        - [ESLint](#eslint)
        - [Prettier](#prettier)

### Serving the application

- To serve the application run `npm run`
- To build the applcation run `npm run build`

##### Webpack

We use webpack for bundling, building and serving the application in development and production.

##### Babel

Babel is used as the complier to convert our source code to older versions of JavaScript.

### Formatting and validation

- To format the application: `npm run format`
- To check for linting errors: `npm run lint`
- To check **and fix** linting errors: `npm run lint:fix`

##### ESLint

We use ESLint to validate the pattern and validity of the source code. The rules and configurations for ESLint are defined in `.eslintrc.json`, which can be found in the project root folder.

##### Prettier

We use Prettier for code formatting. The syntax rules are defined in `.prettierrc.json`, which can be found in the project root folder.
