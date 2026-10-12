import { createDrawerNavigator } from '@react-navigation/drawer';

import { useTheme } from '@/theme';

import { DrawerContent } from './DrawerContent';
import { MainTabNavigator } from './MainTabNavigator';
import type { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerType: 'front',
        headerShown: false,
        drawerStyle: { backgroundColor: colors.background },
        overlayColor: colors.overlay,
      }}
    >
      <Drawer.Screen component={MainTabNavigator} name="MainTabs" />
    </Drawer.Navigator>
  );
}
