import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  TransactionList: undefined;
  TransactionDetail: { refId: string };
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
