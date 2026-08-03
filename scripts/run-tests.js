/**
 * Temporary test-runner wrapper for CRA.
 *
 * Why this exists:
 * CRA/react-scripts pulls older transitive dependencies that can emit noisy
 * Node deprecation warnings (for example DEP0040/punycode) during tests.
 * This wrapper centralizes warning filtering so test output stays readable.
 *
 * When to remove:
 * Remove this file once the project has migrated away from CRA/react-scripts
 * (for example to Vite/Vitest) or after dependency upgrades confirm these
 * warnings no longer appear in CI/local test runs.
 *
 * How to remove:
 * 1) Update package.json test script to call the test runner directly.
 * 2) Delete this file and the scripts folder if it is otherwise empty.
 * 3) Verify test output in local and CI is still clean.
 */

const existingNodeOptions = process.env.NODE_OPTIONS || '';
const options = existingNodeOptions
  .split(' ')
  .map((part) => part.trim())
  .filter(Boolean);

if (!options.includes('--disable-warning=DEP0040')) {
  options.push('--disable-warning=DEP0040');
}

process.env.NODE_OPTIONS = options.join(' ');

require('react-scripts/scripts/test');
