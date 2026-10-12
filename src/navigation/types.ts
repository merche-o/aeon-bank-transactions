import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type PaymentConfirmParams = {
  kind: 'transfer' | 'schedule' | 'request';
  refId?: string;
  paymentRequestId?: string;
};

export type TransactionsStackParamList = {
  TransactionList: undefined;
  TransactionDetail: { refId: string };
  AddTransaction: undefined;
  PaymentStart: { mode?: 'transfer' | 'request' } | undefined;
  QuickPay: { recipientId: string };
  RequestPay: { recipientId: string };
  PaymentConfirm: PaymentConfirmParams;
  AddRecipient: undefined;
  Profile: undefined;
};

export type RecipientsStackParamList = {
  RecipientList: undefined;
  RecipientDetail: { recipientId: string };
  TransactionDetail: { refId: string };
  AddRecipient: undefined;
  QuickPay: { recipientId: string };
  RequestPay: { recipientId: string };
  PaymentConfirm: PaymentConfirmParams;
  ScheduledList: undefined;
  PaymentRequestsList: undefined;
};

export type MainTabParamList = {
  TransactionsTab: NavigatorScreenParams<TransactionsStackParamList> | undefined;
  RecipientsTab: NavigatorScreenParams<RecipientsStackParamList> | undefined;
  BudgetTab: undefined;
};

export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
};

export type TransactionsStackNavigationProp =
  NativeStackNavigationProp<TransactionsStackParamList>;

export type RecipientsStackNavigationProp =
  NativeStackNavigationProp<RecipientsStackParamList>;

export type TransactionListNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<TransactionsStackParamList, 'TransactionList'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    DrawerNavigationProp<DrawerParamList>
  >
>;

/** @deprecated Use TransactionsStackNavigationProp for stack-only screens */
export type RootStackParamList = TransactionsStackParamList;

/** @deprecated Use TransactionListNavigationProp */
export type RootNavigationProp = TransactionsStackNavigationProp;
