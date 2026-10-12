import { StateMessage } from './StateMessage';

export type EmptyStateProps = {
  title: string;
  testID?: string;
};

export function EmptyState({ title, testID = 'empty-state' }: EmptyStateProps) {
  return <StateMessage testID={testID} title={title} />;
}
