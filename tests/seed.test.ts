import { seedIfEmpty } from '../db/seed';
import { db } from '../db/client';

jest.mock('../db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

const mockDb = db as unknown as { select: jest.Mock; insert: jest.Mock };

describe('seedIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts data into all tables when users table is empty', async () => {
    const mockReturning = jest.fn().mockResolvedValue([{ id: 1, name: 'Demo User', email: 'demo@example.com', password: 'password123', createdAt: '2026-01-01' }]);
    const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
    const mockFrom = jest.fn().mockResolvedValue([]);

    mockDb.select.mockReturnValue({ from: mockFrom });
    mockDb.insert.mockReturnValue({ values: mockValues });

    await seedIfEmpty();

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Demo User', email: 'demo@example.com' })
    );
  });

  it('does nothing when users already exist', async () => {
    const mockFrom = jest.fn().mockResolvedValue([
      { id: 1, name: 'Demo User', email: 'demo@example.com', password: 'password123', createdAt: '2026-01-01' },
    ]);
    mockDb.select.mockReturnValue({ from: mockFrom });

    await seedIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
