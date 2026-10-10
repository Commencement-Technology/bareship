import { setupServer } from 'msw/node';

import { handlers } from './handlers';

/** Mock backend for Jest. `src/test/setup.ts` starts it and resets state between tests. */
export const server = setupServer(...handlers);
