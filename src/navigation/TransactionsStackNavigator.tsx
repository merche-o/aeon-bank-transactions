import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddTransactionView } from '@/presentation/views/AddTransactionView';
import { ProfileSettingsView } from '@/presentation/views/ProfileSettingsView';
import { TransactionDetailView } from '@/presentation/views/TransactionDetailView';
import { TransactionListView } from '@/presentation/views/TransactionListView';
import { useTheme } from '@/theme';

import type { TransactionsStackParamList } from './types';

const Stack = createNativeStackNavigator<TransactionsStackParamList>();

export function TransactionsStackNavigator() {
  const theme = useTheme();
  const { colors } = theme;

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary },
      }}
    >
      <Stack.Screen
        component={TransactionListView}
        name="TransactionList"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={TransactionDetailScreen}
        name="TransactionDetail"
        options={{ title: '' }}
      />
      <Stack.Screen
        component={AddTransactionView}
        name="AddTransaction"
        options={{ headerShown: true }}
      />
      <Stack.Screen
        component={ProfileSettingsView}
        name="Profile"
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}

function TransactionDetailScreen({
  route,
}: NativeStackScreenProps<TransactionsStackParamList, 'TransactionDetail'>) {
  return <TransactionDetailView refId={route.params.refId} />;
}
