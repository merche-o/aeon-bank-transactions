import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { t } from '@/i18n';
import { TransactionDetailView } from '@/presentation/views/TransactionDetailView';
import { TransactionListView } from '@/presentation/views/TransactionListView';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useTheme } from '@/theme';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const locale = usePreferencesStore((state) => state.locale);
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
        options={{
          title: t('detail.title', locale),
        }}
      />
    </Stack.Navigator>
  );
}

function TransactionDetailScreen({
  route,
}: NativeStackScreenProps<RootStackParamList, 'TransactionDetail'>) {
  return <TransactionDetailView refId={route.params.refId} />;
}
