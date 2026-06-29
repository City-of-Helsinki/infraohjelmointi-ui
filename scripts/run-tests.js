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
