import type { Recipient } from '@/models/Recipient';
import type { RecipientRepository } from '@/repositories/RecipientRepository';
import {
  resetRecipientRepository,
  resetRecipientStore,
  setRecipientRepository,
  useRecipientStore,
} from '@/store/recipientStore';

const seed: Recipient[] = [
  {
    id: 'R1',
    displayName: 'John Doe',
    accountHint: '****1234',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

function createFakeRepository(
  overrides?: Partial<RecipientRepository>,
): RecipientRepository {
  return {
    list: jest.fn().mockResolvedValue(seed),
    add: jest.fn(),
    remove: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('recipientStore', () => {
  beforeEach(() => {
    resetRecipientStore();
    resetRecipientRepository();
  });

  it('fetch loads recipients from the repository', async () => {
    const repository = createFakeRepository();
    setRecipientRepository(repository);

    await useRecipientStore.getState().fetch();

    expect(repository.list).toHaveBeenCalledTimes(1);
    expect(useRecipientStore.getState().recipients).toEqual(seed);
    expect(useRecipientStore.getState().loading).toBe(false);
    expect(useRecipientStore.getState().error).toBeNull();
  });

  it('sets error when list fails and clearError clears it', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const repository = createFakeRepository({
      list: jest.fn().mockRejectedValue(new Error('offline')),
    });
    setRecipientRepository(repository);

    await useRecipientStore.getState().fetch();

    expect(useRecipientStore.getState().error).toBe('offline');
    useRecipientStore.getState().clearError();
    expect(useRecipientStore.getState().error).toBeNull();
    consoleError.mockRestore();
  });

  it('add prepends the created recipient', async () => {
    const created: Recipient = {
      id: 'R99',
      displayName: 'New Friend',
      createdAt: '2024-02-01T00:00:00.000Z',
    };
    const repository = createFakeRepository({
      add: jest.fn().mockResolvedValue(created),
    });
    setRecipientRepository(repository);
    useRecipientStore.setState({ recipients: seed });

    const result = await useRecipientStore.getState().add({
      displayName: 'New Friend',
    });

    expect(result).toEqual(created);
    expect(useRecipientStore.getState().recipients[0]?.id).toBe('R99');
  });

  it('remove deletes by id', async () => {
    const repository = createFakeRepository();
    setRecipientRepository(repository);
    useRecipientStore.setState({ recipients: seed });

    await useRecipientStore.getState().remove('R1');

    expect(repository.remove).toHaveBeenCalledWith('R1');
    expect(useRecipientStore.getState().recipients).toHaveLength(0);
  });
});
