import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddRecipientView } from '@/presentation/views/AddRecipientView';
import { AddTransactionView } from '@/presentation/views/AddTransactionView';
import { PaymentConfirmView } from '@/presentation/views/PaymentConfirmView';
import { PaymentStartView } from '@/presentation/views/PaymentStartView';
import { ProfileSettingsView } from '@/presentation/views/ProfileSettingsView';
import { QuickPayView } from '@/presentation/views/QuickPayView';
import { RequestPayView } from '@/presentation/views/RequestPayView';
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
        headerBackButtonDisplayMode: 'minimal',
        headerBackTitle: '',
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
        component={PaymentStartView}
        name="PaymentStart"
        options={{ headerShown: true }}
      />
      <Stack.Screen component={TransactionsQuickPayScreen} name="QuickPay" />
      <Stack.Screen component={TransactionsRequestPayScreen} name="RequestPay" />
      <Stack.Screen
        component={PaymentConfirmView}
        name="PaymentConfirm"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen component={AddRecipientView} name="AddRecipient" />
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

function TransactionsQuickPayScreen({
  route,
}: NativeStackScreenProps<TransactionsStackParamList, 'QuickPay'>) {
  return <QuickPayView recipientId={route.params.recipientId} />;
}

function TransactionsRequestPayScreen({
  route,
}: NativeStackScreenProps<TransactionsStackParamList, 'RequestPay'>) {
  return <RequestPayView recipientId={route.params.recipientId} />;
}
