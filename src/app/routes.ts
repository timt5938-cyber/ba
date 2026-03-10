import { createBrowserRouter } from 'react-router';

import { AppLayout } from './layouts/AppLayout';

import SplashScreen       from './pages/SplashScreen';
import AuthScreen         from './pages/AuthScreen';
import GamesScreen        from './pages/GamesScreen';
import MatchDetailScreen  from './pages/MatchDetailScreen';
import BuildsScreen       from './pages/BuildsScreen';
import BuildDetailScreen  from './pages/BuildDetailScreen';
import AnalyticsScreen    from './pages/AnalyticsScreen';
import AccountScreen      from './pages/AccountScreen';
import ProfileScreen      from './pages/ProfileScreen';
import CompareScreen      from './pages/CompareScreen';
import GoalsScreen        from './pages/GoalsScreen';
import NotificationsScreen from './pages/NotificationsScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SplashScreen,
  },
  {
    path: '/auth',
    Component: AuthScreen,
  },
  {
    path: '/app',
    Component: AppLayout,
    children: [
      { index: true,                   Component: GamesScreen },
      { path: 'games',                 Component: GamesScreen },
      { path: 'games/:matchId',        Component: MatchDetailScreen },
      { path: 'builds',                Component: BuildsScreen },
      { path: 'builds/:buildId',       Component: BuildDetailScreen },
      { path: 'analytics',             Component: AnalyticsScreen },
      { path: 'account',               Component: AccountScreen },
      { path: 'profile',               Component: ProfileScreen },
      { path: 'profile/:section',      Component: ProfileScreen },
      { path: 'comparison',            Component: CompareScreen },
      { path: 'goals',                 Component: GoalsScreen },
      { path: 'notifications',         Component: NotificationsScreen },
    ],
  },
]);