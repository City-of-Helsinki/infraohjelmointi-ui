// CI's commitlint (wagoid/commitlint-github-action) picks this file up by default.
// Same as the built-in fallback, except body/footer line length is not limited:
// Dependabot's commit bodies contain long release-note URLs that would always fail it.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};