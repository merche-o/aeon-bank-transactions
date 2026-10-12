import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AddRecipientView } from '@/presentation/views/AddRecipientView';
import { PaymentConfirmView } from '@/presentation/views/PaymentConfirmView';
import { PaymentRequestsListView } from '@/presentation/views/PaymentRequestsListView';
import { QuickPayView } from '@/presentation/views/QuickPayView';
import { RecipientDetailView } from '@/presentation/views/RecipientDetailView';
import { RecipientListView } from '@/presentation/views/RecipientListView';
import { RequestPayView } from '@/presentation/views/RequestPayView';
import { ScheduledListView } from '@/presentation/views/ScheduledListView';
import { TransactionDetailView } from '@/presentation/views/TransactionDetailView';
import { useTheme } from '@/theme';

import type { RecipientsStackParamList } from './types';

const Stack = createNativeStackNavigator<RecipientsStackParamList>();

export function RecipientsStackNavigator() {
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
        component={RecipientListView}
        name="RecipientList"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={RecipientDetailScreen}
        name="RecipientDetail"
        options={{ title: '' }}
      />
      <Stack.Screen component={AddRecipientView} name="AddRecipient" />
      <Stack.Screen component={QuickPayScreen} name="QuickPay" />
      <Stack.Screen component={RequestPayScreen} name="RequestPay" />
      <Stack.Screen
        component={PaymentConfirmView}
        name="PaymentConfirm"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        component={RecipientTransactionDetailScreen}
        name="TransactionDetail"
        options={{ title: '' }}
      />
      <Stack.Screen component={ScheduledListView} name="ScheduledList" />
      <Stack.Screen
        component={PaymentRequestsListView}
        name="PaymentRequestsList"
      />
    </Stack.Navigator>
  );
}

function RecipientDetailScreen({
  route,
}: NativeStackScreenProps<RecipientsStackParamList, 'RecipientDetail'>) {
  return <RecipientDetailView recipientId={route.params.recipientId} />;
}

function QuickPayScreen({
  route,
}: NativeStackScreenProps<RecipientsStackParamList, 'QuickPay'>) {
  return <QuickPayView recipientId={route.params.recipientId} />;
}

function RequestPayScreen({
  route,
}: NativeStackScreenProps<RecipientsStackParamList, 'RequestPay'>) {
  return <RequestPayView recipientId={route.params.recipientId} />;
}

function RecipientTransactionDetailScreen({
  route,
}: NativeStackScreenProps<RecipientsStackParamList, 'TransactionDetail'>) {
  return <TransactionDetailView refId={route.params.refId} />;
}
