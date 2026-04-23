import React from 'react';
import { render } from '@testing-library/react-native';
import { AppContext } from '../context/app-context';
import { AuthContext } from '../context/auth-context';
import { ThemeContext, lightColors } from '../context/theme-context';
import TripsScreen from '../app/(tabs)/index';

jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  Redirect: () => null,
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const mockTrip = {
  id: 1,
  userId: 1,
  name: 'Paris Holiday',
  destination: 'Paris, France',
  startDate: '2025-06-01',
  endDate: '2025-06-10',
  notes: null,
  createdAt: '2025-01-01T00:00:00.000Z',
};

const mockCategory = {
  id: 1,
  userId: 1,
  name: 'Sightseeing',
  color: '#3B82F6',
  icon: 'camera',
  createdAt: '2025-01-01T00:00:00.000Z',
};

const mockUser = { id: 1, email: 'test@test.com', name: 'Test User' };

const mockTheme = {
  theme: 'light' as const,
  toggleTheme: jest.fn(),
  colors: lightColors,
};

const mockAppContext = {
  trips: [mockTrip],
  activities: [],
  categories: [mockCategory],
  targets: [],
  setTrips: jest.fn(),
  setActivities: jest.fn(),
  setCategories: jest.fn(),
  setTargets: jest.fn(),
};

describe('TripsScreen', () => {
  it('renders seeded trip from database and the Add Trip button', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme}>
        <AuthContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <AppContext.Provider value={mockAppContext}>
            <TripsScreen />
          </AppContext.Provider>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('Paris Holiday')).toBeTruthy();
    expect(getByText('+ Add Trip')).toBeTruthy();
  });

  it('shows empty state when no trips exist', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockTheme}>
        <AuthContext.Provider value={{ user: mockUser, setUser: jest.fn() }}>
          <AppContext.Provider value={{ ...mockAppContext, trips: [] }}>
            <TripsScreen />
          </AppContext.Provider>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('No trips yet')).toBeTruthy();
  });
});
