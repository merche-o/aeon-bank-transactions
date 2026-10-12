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

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  const MockPicker = ({
    testID,
    value,
    onChange,
  }: {
    testID?: string;
    value: Date;
    onChange?: (event: { type: string }, date?: Date) => void;
  }) =>
    React.createElement(
      Pressable,
      {
        testID: testID ?? 'mock-datetime-picker',
        onPress: () => onChange?.({ type: 'set' }, value),
      },
      React.createElement(Text, null, value.toISOString()),
    );
  return {
    __esModule: true,
    default: MockPicker,
    DateTimePickerAndroid: {
      open: jest.fn(),
      dismiss: jest.fn(),
    },
  };
});
