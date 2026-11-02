import { Buffer } from 'buffer';

// @react-pdf/layout references a global Buffer when resolving images.
globalThis.Buffer ??= Buffer;
