import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type TransactionsStackParamList = {
  TransactionList: undefined;
  TransactionDetail: { refId: string };
  AddTransaction: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  TransactionsTab: NavigatorScreenParams<TransactionsStackParamList> | undefined;
  BudgetTab: undefined;
};

export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
};

export type TransactionsStackNavigationProp =
  NativeStackNavigationProp<TransactionsStackParamList>;

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
