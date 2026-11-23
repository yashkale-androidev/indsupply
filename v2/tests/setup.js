import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

import { resetMockDb } from '../src/api/mock.js';

beforeEach(() => { localStorage.clear(); resetMockDb(); });
afterEach(() => cleanup());
window.scrollTo = () => {};
