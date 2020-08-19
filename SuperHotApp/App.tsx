/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {StatusBar} from 'react-native';

import {createPagesRouter} from './src/routes';
import {NavigationContainer} from '@react-navigation/native';

import {LogBox} from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Each child in a list should have a unique "key" prop',
]);

class App extends React.Component<any, any> {
  render() {
    return (
      <NavigationContainer>
        <StatusBar barStyle="light-content" translucent={false} />
        {createPagesRouter()}
      </NavigationContainer>
    );
  }
}

export default App;
