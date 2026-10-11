/**
 * Entry point for demo release builds only (`pnpm build:android:demo`, ADR 0004): a release build that
 * serves the API from the in-app mock backend, for trying the app on a device before a backend exists.
 * Gradle refuses to bundle it for the staging and prod flavors.
 */
import { provideMockAdapter } from './src/app/mock-backend';
import { startMocks } from './src/mocks/native';

provideMockAdapter(startMocks());

require('./index');
