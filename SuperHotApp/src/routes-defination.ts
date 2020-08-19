import {RouteProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {TicketInfo} from './pages/TicketsPage';

export enum PageNames {
  Home = 'Home',
  Trending = 'Trending',
  Details = 'Details',
  My = 'My',
}
export type PropsOfPages = {
  Home: undefined;
  Trending: {forceRefresh?: () => void};
  Details: {ticket: TicketInfo};
  My: undefined;
  // Home: {};
  // News: {getWalletInfo?: () => void};
  // Mining: {queryData?: () => void; listUserStatus?: () => void};
  // Dapps: {getWalletInfo?: () => void; getNetwork?: () => void};
  // Mine: {getWalletInfo?: () => void; tabBarLabel?: string};
  // Splash: undefined;

  // WebView: undefined;
  // Web: undefined;

  // Login: {title: string; callbackRoute: string; params: any};
};
export type TrendingPageProps = {
  route: RouteProp<PropsOfPages, PageNames.Trending>;
  navigation: BottomTabNavigationProp<PropsOfPages, PageNames.Trending>;
};

export type DetailsPageProps = {
  route: RouteProp<PropsOfPages, PageNames.Details>;
  navigation: BottomTabNavigationProp<PropsOfPages, PageNames.Details>;
};

export type MyPageProps = {
  route: RouteProp<PropsOfPages, PageNames.My>;
  navigation: BottomTabNavigationProp<PropsOfPages, PageNames.My>;
};
