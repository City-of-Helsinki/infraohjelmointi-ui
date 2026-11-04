// Trailing slash forces the npm browser polyfill instead of the Node built-in.
import { Buffer } from 'buffer/';

// @react-pdf/layout references a global Buffer when resolving images.
globalThis.Buffer ??= Buffer as unknown as typeof globalThis.Buffer;
