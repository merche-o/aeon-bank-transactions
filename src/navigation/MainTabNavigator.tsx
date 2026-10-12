import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Text } from 'react-native';

import { BudgetView } from '@/presentation/views/BudgetView';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTheme } from '@/theme';
import { t } from '@/i18n';

import { RecipientsStackNavigator } from './RecipientsStackNavigator';
import { TransactionsStackNavigator } from './TransactionsStackNavigator';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const theme = useTheme();
  const { colors, typography } = theme;
  const locale = usePreferencesStore((state) => state.locale);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSubtle,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        component={TransactionsStackNavigator}
        name="TransactionsTab"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'list' : 'list-outline'}
              size={size}
            />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: typography.fontSize.xs }}>
              {t('tabs.transactions', locale)}
            </Text>
          ),
          tabBarButton: (props) => (
            <PlatformPressable {...props} testID="tab-transactions" />
          ),
        }}
      />
      <Tab.Screen
        component={RecipientsStackNavigator}
        name="RecipientsTab"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'people' : 'people-outline'}
              size={size}
            />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: typography.fontSize.xs }}>
              {t('tabs.recipients', locale)}
            </Text>
          ),
          tabBarButton: (props) => (
            <PlatformPressable {...props} testID="tab-recipients" />
          ),
        }}
      />
      <Tab.Screen
        component={BudgetView}
        name="BudgetTab"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={size}
            />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: typography.fontSize.xs }}>
              {t('tabs.budget', locale)}
            </Text>
          ),
          tabBarButton: (props) => (
            <PlatformPressable {...props} testID="tab-budget" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
