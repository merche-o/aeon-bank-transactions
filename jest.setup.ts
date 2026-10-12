jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockIcon = ({ name, testID }: { name?: string; testID?: string }) =>
    React.createElement(Text, { testID }, name ?? 'icon');
  return {
    Ionicons: MockIcon,
    MaterialIcons: MockIcon,
    createIconSet: () => MockIcon,
  };
});
