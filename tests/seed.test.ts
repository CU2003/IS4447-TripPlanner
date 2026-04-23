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
    let callCount = 0;
    mockDb.insert.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              { id: 1, name: 'Demo User', email: 'demo@example.com', password: 'password123', createdAt: '2026-01-01' },
            ]),
          }),
        };
      }
      if (callCount === 2) {
        return {
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              { id: 1, name: 'Sightseeing', color: '#E74C3C', icon: 'binoculars', userId: 1, createdAt: '2026-01-01' },
              { id: 2, name: 'Outdoor', color: '#27AE60', icon: 'walk', userId: 1, createdAt: '2026-01-01' },
              { id: 3, name: 'Food & Drink', color: '#F39C12', icon: 'restaurant', userId: 1, createdAt: '2026-01-01' },
              { id: 4, name: 'Transport', color: '#3498DB', icon: 'bus', userId: 1, createdAt: '2026-01-01' },
              { id: 5, name: 'Accommodation', color: '#9B59B6', icon: 'bed', userId: 1, createdAt: '2026-01-01' },
            ]),
          }),
        };
      }
      if (callCount === 3) {
        return {
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              { id: 1, name: 'Paris Spring Break', destination: 'Paris, France', startDate: '2026-03-10', endDate: '2026-03-17', notes: null, userId: 1, createdAt: '2026-01-01' },
              { id: 2, name: 'London Weekend', destination: 'London, UK', startDate: '2026-04-01', endDate: '2026-04-06', notes: null, userId: 1, createdAt: '2026-01-01' },
              { id: 3, name: 'Barcelona Getaway', destination: 'Barcelona, Spain', startDate: '2026-05-15', endDate: '2026-05-22', notes: null, userId: 1, createdAt: '2026-01-01' },
            ]),
          }),
        };
      }
      return { values: jest.fn().mockResolvedValue(undefined) };
    });

    mockDb.select.mockReturnValue({ from: jest.fn().mockResolvedValue([]) });

    await seedIfEmpty();

    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('does nothing when users already exist', async () => {
    mockDb.select.mockReturnValue({
      from: jest.fn().mockResolvedValue([
        { id: 1, name: 'Demo User', email: 'demo@example.com', password: 'password123', createdAt: '2026-01-01' },
      ]),
    });

    await seedIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});

describe('seedIfEmpty — core tables', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts all three trips into the trips table', async () => {
    let callCount = 0;
    let capturedTripValues: { name: string }[] = [];

    mockDb.insert.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              { id: 1, name: 'Demo User', email: 'demo@example.com', password: 'password123', createdAt: '2026-01-01' },
            ]),
          }),
        };
      }
      if (callCount === 2) {
        return {
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              { id: 1, name: 'Sightseeing', color: '#E74C3C', icon: 'binoculars', userId: 1, createdAt: '2026-01-01' },
              { id: 2, name: 'Outdoor', color: '#27AE60', icon: 'walk', userId: 1, createdAt: '2026-01-01' },
              { id: 3, name: 'Food & Drink', color: '#F39C12', icon: 'restaurant', userId: 1, createdAt: '2026-01-01' },
              { id: 4, name: 'Transport', color: '#3498DB', icon: 'bus', userId: 1, createdAt: '2026-01-01' },
              { id: 5, name: 'Accommodation', color: '#9B59B6', icon: 'bed', userId: 1, createdAt: '2026-01-01' },
            ]),
          }),
        };
      }
      if (callCount === 3) {
        const mockValues = jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            { id: 1, name: 'Paris Spring Break', destination: 'Paris, France', startDate: '2026-03-10', endDate: '2026-03-17', notes: null, userId: 1, createdAt: '2026-01-01' },
            { id: 2, name: 'London Weekend', destination: 'London, UK', startDate: '2026-04-01', endDate: '2026-04-06', notes: null, userId: 1, createdAt: '2026-01-01' },
            { id: 3, name: 'Barcelona Getaway', destination: 'Barcelona, Spain', startDate: '2026-05-15', endDate: '2026-05-22', notes: null, userId: 1, createdAt: '2026-01-01' },
          ]),
        });
        return {
          values: (vals: { name: string }[]) => {
            capturedTripValues = vals;
            return mockValues(vals);
          },
        };
      }
      return { values: jest.fn().mockResolvedValue(undefined) };
    });

    mockDb.select.mockReturnValue({ from: jest.fn().mockResolvedValue([]) });

    await seedIfEmpty();

    const names = capturedTripValues.map((t) => t.name);
    expect(names).toContain('Paris Spring Break');
    expect(names).toContain('London Weekend');
    expect(names).toContain('Barcelona Getaway');
    expect(capturedTripValues).toHaveLength(3);
  });

  it('does not insert duplicates when called twice on a populated table', async () => {
    const mockValues = jest.fn().mockResolvedValue(undefined);
    mockDb.select.mockReturnValue({
      from: jest.fn().mockResolvedValue([
        { id: 1, name: 'Demo User', email: 'demo@example.com', password: 'password123', createdAt: '2026-01-01' },
      ]),
    });
    mockDb.insert.mockReturnValue({ values: mockValues });

    await seedIfEmpty();
    await seedIfEmpty();

    expect(mockValues).not.toHaveBeenCalled();
  });
});
