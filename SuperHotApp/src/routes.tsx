import 'react-native-gesture-handler';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import TicketsPage from './pages/TicketsPage';
import ManagePage from './pages/ManagePage';
import DetailPage from './pages/DetailPage';
import {PropsOfPages, PageNames} from './routes-defination';

const Tab = createBottomTabNavigator<PropsOfPages>();
function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName={PageNames.Trending}
      tabBarOptions={{
        activeTintColor: '#FFFFFF',
        inactiveTintColor: '#626265',
        style: {
          // height: 50,
          backgroundColor: 'rgba(27,27,32,.95)',
          // paddingTop: 7,
          borderTopWidth: 0.5,
          borderTopColor: '#36363B',
        },
        labelStyle: {
          fontSize: 20,
          fontWeight: 'normal',
          fontStyle: 'italic',
          // lineHeight: 13,
          // color: "#FFFFFF",

          marginBottom: 5,
          marginTop: 2,
        },
        tabStyle: {
          // paddingTop: 0,
        },
      }}>
      <Tab.Screen
        name={PageNames.Trending}
        component={TicketsPage}
        options={{
          tabBarLabel: '票据',
          tabBarIcon: () => undefined,
        }}
      />
      <Tab.Screen
        name={PageNames.My}
        component={ManagePage}
        options={{
          tabBarLabel: '管理',
        }}
      />
    </Tab.Navigator>
  );
}

const ScreensStack = createStackNavigator<PropsOfPages>();
export function createPagesRouter() {
  return (
    <ScreensStack.Navigator
      initialRouteName={PageNames.Home}
      headerMode="screen"
      screenOptions={{
        headerTintColor: '#fff',
        headerStyle: {
          backgroundColor: '#1E1E24',
          borderBottomWidth: 0.5,
          borderBottomColor: '#1E1E24',
        },
        headerTitleStyle: {
          color: '#fff',
          fontSize: 16,
          fontFamily: 'Futura-Medium',
          fontWeight: '400',
          margin: 5,
          alignSelf: 'center',
          flex: 1,
          textAlign: 'center',
        },
        headerTruncatedBackTitle: '',
      }}>
      <ScreensStack.Screen
        name={PageNames.Home}
        component={MyTabs}
        options={{headerShown: false}}
      />
      <ScreensStack.Screen
        name={PageNames.Details}
        component={DetailPage}
        options={{headerShown: true}}
      />
      {/* <ScreensStack.Screen
        name={PagesName.EMAILLOGIN}
        component={EmailLoginPage}
        options={({route}) => ({
          title: route.params?.title ?? I18n.t('login.LoginWithEmail'),
          headerBackTitle: undefined,
        })}
      />

      <ScreensStack.Screen
        name={PagesName.CREATEWALLET}
        component={CreateWalletPage}
        options={({route}) => {
          let opt: StackHeaderOptions = {
            headerTitle: I18n.t('page.createWalletTitle'),
          };
          if (route.params?.goBack === 'noBack') {
            opt.headerLeft = () => <View />;
          }
          return opt;
        }}
      /> */}
    </ScreensStack.Navigator>
  );
}
