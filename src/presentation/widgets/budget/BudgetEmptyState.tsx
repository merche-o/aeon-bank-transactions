import { StateMessage } from '../StateMessage';

export type BudgetEmptyStateProps = {
  message: string;
  testID?: string;
};

export function BudgetEmptyState({ message, testID = 'budget-empty-state' }: BudgetEmptyStateProps) {
  return <StateMessage testID={testID} title={message} />;
}
