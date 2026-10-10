/**
 * @format
 */

// Unistyles must be configured before any StyleSheet.create runs.
import './src/shared/ui/theme/unistyles';

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';
import { App } from './src/app/App';

AppRegistry.registerComponent(appName, () => App);
