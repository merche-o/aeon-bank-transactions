import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated } from 'react-native';

import { t } from '@/i18n';
import type {
  PaymentConfirmParams,
  RecipientsStackNavigationProp,
  RecipientsStackParamList,
  TransactionsStackNavigationProp,
  TransactionsStackParamList,
} from '@/navigation/types';
import { usePaymentRequestStore } from '@/store/paymentRequestStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useRecipientStore } from '@/store/recipientStore';
import { useTransactionStore } from '@/store/transactionStore';
import { getCategoryLabel } from '@/utils/categories';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

type ConfirmRoute =
  | RouteProp<TransactionsStackParamList, 'PaymentConfirm'>
  | RouteProp<RecipientsStackParamList, 'PaymentConfirm'>;

type ConfirmNavigation =
  | TransactionsStackNavigationProp
  | RecipientsStackNavigationProp;

function successTitleKey(
  kind: PaymentConfirmParams['kind'],
):
  | 'pay.confirmSuccessTransfer'
  | 'pay.confirmSuccessSchedule'
  | 'pay.confirmSuccessRequest' {
  if (kind === 'schedule') {
    return 'pay.confirmSuccessSchedule';
  }
  if (kind === 'request') {
    return 'pay.confirmSuccessRequest';
  }
  return 'pay.confirmSuccessTransfer';
}

export function usePaymentConfirmViewModel() {
  const navigation = useNavigation<ConfirmNavigation>();
  const route = useRoute<ConfirmRoute>();
  const { kind, refId, paymentRequestId } = route.params;

  const locale = usePreferencesStore((state) => state.locale);
  const transaction = useTransactionStore((state) =>
    refId
      ? state.transactions.find((item) => item.refId === refId)
      : paymentRequestId
        ? state.findByPaymentRequestId(paymentRequestId)
        : undefined,
  );
  const paymentRequest = usePaymentRequestStore((state) =>
    paymentRequestId
      ? state.paymentRequests.find((item) => item.id === paymentRequestId)
      : undefined,
  );
  const recipient = useRecipientStore((state) => {
    const recipientId =
      transaction?.recipientId ?? paymentRequest?.recipientId;
    if (!recipientId) {
      return undefined;
    }
    return state.recipients.find((item) => item.id === recipientId);
  });

  const [showDetails, setShowDetails] = useState(false);
  const scale = useMemo(() => new Animated.Value(0.4), []);
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setShowDetails(true);
      }
    });
  }, [opacity, scale]);

  const amount = transaction?.amount ?? paymentRequest?.amount ?? 0;
  const recipientName =
    transaction?.recipientName ?? recipient?.displayName ?? '';
  const transferName =
    transaction?.transferName ??
    paymentRequest?.transferName ??
    '';
  const category =
    transaction?.category ?? paymentRequest?.category ?? 'unknown';
  const dateIso =
    transaction?.scheduledFor ??
    transaction?.transferDate ??
    paymentRequest?.createdAt ??
    new Date().toISOString();
  const status =
    transaction?.status ??
    (kind === 'request' ? 'pending' : kind === 'schedule' ? 'scheduled' : 'completed');

  const statusLabel = useMemo(() => {
    if (status === 'pending') {
      return t('status.pending', locale);
    }
    if (status === 'scheduled') {
      return t('status.scheduled', locale);
    }
    return t('status.completed', locale);
  }, [locale, status]);

  const done = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  const openDetail = useCallback(() => {
    const id = transaction?.refId ?? refId;
    if (!id) {
      return;
    }
    (
      navigation as TransactionsStackNavigationProp
    ).replace('TransactionDetail', { refId: id });
  }, [navigation, refId, transaction?.refId]);

  return {
    locale,
    kind,
    showDetails,
    scale,
    opacity,
    amountFormatted: formatCurrency(amount),
    recipientName,
    transferName,
    categoryLabel: getCategoryLabel(category, locale),
    dateLabel: formatDate(dateIso),
    statusLabel,
    canOpenDetail: Boolean(transaction?.refId ?? refId),
    done,
    openDetail,
    labels: {
      title: t('pay.confirmTitle', locale),
      success: t(successTitleKey(kind), locale),
      amount: t('detail.amount', locale),
      recipient: t('detail.recipient', locale),
      transferName: t('detail.transferName', locale),
      category: t('detail.category', locale),
      date: t('detail.date', locale),
      status: t('detail.status', locale),
      done: t('pay.confirmDone', locale),
      viewDetail: t('pay.confirmViewDetail', locale),
    },
  };
}
