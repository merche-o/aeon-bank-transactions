import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SecureLogger } from '@/security/SecureLogger';

type Props = {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  retryLabel?: string;
};

type State = {
  hasError: boolean;
};

/**
 * Thin class boundary so a render crash does not blank the whole process.
 * Theme/i18n are intentionally not used here (may be outside providers).
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    SecureLogger.error('AppErrorBoundary caught render error', {
      name: error.name,
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const title = this.props.fallbackTitle ?? 'Something went wrong';
    const message =
      this.props.fallbackMessage ?? 'Please try again to continue.';
    const retryLabel = this.props.retryLabel ?? 'Try again';

    return (
      <View style={styles.root} testID="app-error-boundary">
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={this.handleRetry}
          style={styles.button}
          testID="app-error-boundary-retry"
        >
          <Text style={styles.buttonLabel}>{retryLabel}</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0B5FFF',
    borderRadius: 12,
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: '#5A6472',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  root: {
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});
