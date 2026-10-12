import { secureStorage } from '@/security/secureStorage';

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

describe('secureStorage', () => {
  beforeEach(() => {
    mockGetItemAsync.mockReset();
    mockSetItemAsync.mockReset();
    mockDeleteItemAsync.mockReset();
  });

  it('delegates getItemAsync to SecureStore', async () => {
    mockGetItemAsync.mockResolvedValue('token-value');

    await expect(secureStorage.getItemAsync('auth.token')).resolves.toBe(
      'token-value',
    );
    expect(mockGetItemAsync).toHaveBeenCalledWith('auth.token');
  });

  it('delegates setItemAsync to SecureStore', async () => {
    mockSetItemAsync.mockResolvedValue(undefined);

    await secureStorage.setItemAsync('auth.token', 'secret');
    expect(mockSetItemAsync).toHaveBeenCalledWith('auth.token', 'secret');
  });

  it('delegates deleteItemAsync to SecureStore', async () => {
    mockDeleteItemAsync.mockResolvedValue(undefined);

    await secureStorage.deleteItemAsync('auth.token');
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth.token');
  });
});
