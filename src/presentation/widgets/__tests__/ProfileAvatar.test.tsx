import { fireEvent, render } from '@testing-library/react-native';

import { ThemeProvider } from '@/theme';

import { ProfileAvatar } from '../ProfileAvatar';

describe('ProfileAvatar', () => {
  it('renders the initial and handles press', async () => {
    const onPress = jest.fn();
    const { getByTestId, getByText } = await render(
      <ThemeProvider mode="light">
        <ProfileAvatar initial="A" onPress={onPress} />
      </ThemeProvider>,
    );

    expect(getByText('A')).toBeTruthy();
    fireEvent.press(getByTestId('profile-header-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
